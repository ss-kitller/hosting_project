#!/usr/bin/env python
"""
Script de scraping des navires prévisionnels depuis le site ANP
URL: https://anp.org.ma/fr/services/mvm-navires
"""

import os
import sys
import django
import time
import csv
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from manutention.models import NavirePrevisionnel
from django.utils import timezone

def scrape_navires_anp():
    """
    Scraper les données des navires depuis le site ANP et les sauvegarder en CSV
    Basé sur le script original de l'utilisateur
    """
    print("🚀 Début du scraping des navires depuis ANP...")
    
    # Configuration Chrome headless
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    driver = None
    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.get("https://anp.org.ma/fr/services/mvm-navires")
        
        print("🔗 Navigation vers le site ANP...")
        
        wait = WebDriverWait(driver, 20)
        dropdown = wait.until(EC.presence_of_element_located((By.NAME, "Ports")))
        
        select = Select(dropdown)
        select.select_by_visible_text("Port d'Agadir")
        
        print("📍 Sélection du port d'Agadir...")
        time.sleep(6)
        
        # Vérifier le nombre de résultats affiché
        try:
            result_text = driver.find_element(By.XPATH, "//*[contains(text(), 'RÉSULTAT') or contains(text(), 'résultat')]").text
            print(f"📊 Texte de résultats trouvé: {result_text}")
        except:
            print("ℹ️ Texte de résultats non trouvé")
        
        # Essayer de trouver un sélecteur pour afficher plus de résultats par page
        try:
            # Chercher un dropdown pour le nombre d'éléments par page
            selectors = [
                "select[name*='page']",
                "select[name*='limit']", 
                "select[name*='size']",
                ".page-size select",
                "[class*='page-size'] select",
                "select[onchange*='page']",
                "select[id*='page']",
                "select[class*='page']",
                "select option[value*='100']",
                "select option[value*='50']"
            ]
            
            for selector in selectors:
                try:
                    page_size_select = driver.find_element(By.CSS_SELECTOR, selector)
                    if page_size_select:
                        print(f"🔍 Sélecteur de taille de page trouvé: {selector}")
                        # Essayer de sélectionner la plus grande valeur
                        options = page_size_select.find_elements(By.TAG_NAME, "option")
                        max_value = "100"  # Valeur par défaut
                        for option in options:
                            value = option.get_attribute("value")
                            if value and value.isdigit() and int(value) > int(max_value):
                                max_value = value
                        
                        if max_value != "100":
                            Select(page_size_select).select_by_value(max_value)
                            print(f"📄 Taille de page changée à {max_value}")
                            time.sleep(3)
                        break
                except:
                    continue
        except Exception as e:
            print(f"ℹ️ Impossible de modifier la taille de page: {e}")
        
        # Attendre que le tableau se charge complètement
        time.sleep(3)
        
        # Vérifier s'il y a une pagination - chercher plus de sélecteurs
        pagination_selectors = [
            ".pagination a", ".pager a", "[class*='page']",
            "a[href*='page']", "button[onclick*='page']",
            ".pagination li a", ".pager li a",
            "[class*='pagination'] a", "[class*='pager'] a"
        ]
        
        pagination_elements = []
        for selector in pagination_selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    pagination_elements.extend(elements)
                    print(f"🔍 Sélecteur '{selector}' trouvé: {len(elements)} éléments")
            except:
                continue
        
        # Supprimer les doublons
        pagination_elements = list(set(pagination_elements))
        print(f"🔍 Total éléments de pagination trouvés: {len(pagination_elements)}")
        
        # Afficher les textes des éléments de pagination
        for i, elem in enumerate(pagination_elements[:10]):  # Limiter à 10 pour éviter trop de logs
            try:
                text = elem.get_text(strip=True)
                print(f"📄 Élément pagination {i+1}: '{text}'")
            except:
                print(f"📄 Élément pagination {i+1}: [texte non lisible]")
        
        all_rows_data = []
        
        # Si pas de pagination, récupérer directement
        if not pagination_elements:
            soup = BeautifulSoup(driver.page_source, "html.parser")
            table = soup.find("table")
            
            if table:
                rows = table.find_all("tr")
                print(f"📊 {len(rows)} lignes trouvées dans le tableau (pas de pagination)")
                
                for i, row in enumerate(rows):
                    cols = [td.get_text(strip=True) for td in row.find_all("td")]
                    if cols:
                        print(f"📋 Ligne {i+1}: {cols}")
                        all_rows_data.append(cols)
            else:
                print("❌ Tableau non trouvé sur la page")
                return {
                    'success': False,
                    'error': 'Tableau non trouvé sur la page ANP'
                }
        else:
            # Gérer la pagination
            print("📄 Pagination détectée, récupération de toutes les pages...")
            page_num = 1
            
            while True:
                print(f"📄 Traitement de la page {page_num}...")
                
                # Attendre que le tableau se charge
                time.sleep(2)
                
                soup = BeautifulSoup(driver.page_source, "html.parser")
                table = soup.find("table")
                
                if table:
                    rows = table.find_all("tr")
                    print(f"📊 {len(rows)} lignes trouvées sur la page {page_num}")
                    
                    for i, row in enumerate(rows):
                        cols = [td.get_text(strip=True) for td in row.find_all("td")]
                        if cols:
                            print(f"📋 Page {page_num}, Ligne {i+1}: {cols}")
                            all_rows_data.append(cols)
                
                # Chercher le bouton "Suivant" ou "Next" - logique améliorée
                next_button = None
                next_texts = ['suivant', 'next', '>', '»', 'suiv.', 'next page', 'page suivante']
                
                for element in pagination_elements:
                    try:
                        text = element.get_text(strip=True).lower()
                        href = element.get_attribute("href") or ""
                        onclick = element.get_attribute("onclick") or ""
                        
                        # Vérifier le texte
                        if any(next_text in text for next_text in next_texts):
                            next_button = element
                            print(f"🔍 Bouton suivant trouvé par texte: '{text}'")
                            break
                        
                        # Vérifier l'attribut href
                        if "page" in href.lower() and any(str(i) in href for i in range(2, 10)):
                            next_button = element
                            print(f"🔍 Bouton suivant trouvé par href: '{href}'")
                            break
                            
                        # Vérifier onclick
                        if "page" in onclick.lower() and any(str(i) in onclick for i in range(2, 10)):
                            next_button = element
                            print(f"🔍 Bouton suivant trouvé par onclick: '{onclick}'")
                            break
                            
                    except Exception as e:
                        print(f"⚠️ Erreur lors de l'analyse de l'élément: {e}")
                        continue
                
                if next_button:
                    try:
                        # Vérifier si le bouton est cliquable
                        if next_button.is_enabled() and next_button.is_displayed():
                            print(f"🖱️ Clic sur le bouton suivant pour la page {page_num + 1}")
                            next_button.click()
                            page_num += 1
                            time.sleep(5)  # Attendre plus longtemps pour le chargement
                            
                            # Attendre que le tableau se recharge
                            wait.until(EC.presence_of_element_located((By.TAG_NAME, "table")))
                        else:
                            print("⚠️ Bouton suivant trouvé mais non cliquable")
                            break
                    except Exception as e:
                        print(f"⚠️ Erreur lors du clic sur le bouton suivant: {e}")
                        break
                else:
                    print("✅ Aucun bouton suivant trouvé - dernière page atteinte")
                    break
        
        rows_data = all_rows_data
        
        print(f"📊 Total navires récupérés: {len(rows_data)}")
        
        # Sauvegarder en CSV comme dans le script original
        if rows_data:
            csv_filename = "navires_agadir.csv"
            with open(csv_filename, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(["Nom", "Type", "Statut", "Date", "Heure", "Port", "Consignataire", "Opérateur"])
                writer.writerows(rows_data)
            print(f"💾 Données sauvegardées dans '{csv_filename}'")
            
            # Maintenant insérer les données dans la base Django
            navires_ajoutes = 0
            
            for cols in rows_data:
                if len(cols) >= 8:
                    # Extraire les données
                    nom_navire = cols[0]
                    type_navire = cols[1]
                    statut = cols[2]
                    date_str = cols[3]
                    heure_str = cols[4]
                    port = cols[5]
                    consignataire = cols[6]
                    operateur = cols[7]
                    
                    # Validation des données essentielles
                    if not nom_navire or nom_navire == "Non spécifié":
                        continue
                    
                    # Parser la date - logique améliorée
                    try:
                        date_obj = datetime.strptime(date_str, "%d/%m/%Y").date()
                    except ValueError:
                        # Essayer d'autres formats de date
                        try:
                            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
                        except ValueError:
                            try:
                                date_obj = datetime.strptime(date_str, "%m/%d/%Y").date()
                            except ValueError:
                                print(f"⚠️ Format de date non reconnu: {date_str} pour {nom_navire}")
                                continue
                    
                    # Parser l'heure - logique améliorée
                    try:
                        # Nettoyer l'heure en supprimant les caractères en trop
                        heure_clean = heure_str.replace(':', '').replace('h', ':').replace('H', ':')
                        if len(heure_clean) == 4:  # Format HHMM
                            heure_clean = heure_clean[:2] + ':' + heure_clean[2:]
                        elif len(heure_clean) == 3:  # Format HMM
                            heure_clean = '0' + heure_clean[:1] + ':' + heure_clean[1:]
                        
                        heure_obj = datetime.strptime(heure_clean, "%H:%M").time()
                    except ValueError:
                        print(f"⚠️ Format d'heure non reconnu: {heure_str} pour {nom_navire}")
                        continue
                    
                    # Créer le nouveau navire (pas de vérification d'existence pour permettre les doublons)
                    navire_data = {
                        'nom': nom_navire,
                        'type': type_navire,
                        'statut': statut,
                        'date_arrivee': date_obj,
                        'heure_arrivee': heure_obj,
                        'port': port,
                        'consignataire': consignataire,
                        'operateur': operateur
                    }
                    
                    NavirePrevisionnel.objects.create(**navire_data)
                    navires_ajoutes += 1
        else:
            print("❌ Aucune donnée trouvée")
            return {
                'success': False,
                'error': 'Aucune donnée trouvée'
            }
        
        print(f"\n📈 Résumé du scraping:")
        print(f"   - Navires ajoutés: {navires_ajoutes}")
        print(f"   - Total traité: {len(rows_data)}")
        print(f"   - Navires rejetés (données invalides): {len(rows_data) - navires_ajoutes}")
        
        # Afficher les navires rejetés pour diagnostic
        rejected_count = 0
        for cols in rows_data:
            if len(cols) >= 8:
                nom_navire = cols[0]
                date_str = cols[3]
                heure_str = cols[4]
                
                # Vérifier pourquoi le navire a été rejeté
                if not nom_navire or nom_navire == "Non spécifié":
                    print(f"❌ Navire rejeté - nom invalide: {nom_navire}")
                    rejected_count += 1
                    continue
                
                try:
                    date_obj = datetime.strptime(date_str, "%d/%m/%Y").date()
                except ValueError:
                    print(f"❌ Navire rejeté - date invalide: {date_str} pour {nom_navire}")
                    rejected_count += 1
                    continue
                
                try:
                    heure_obj = datetime.strptime(heure_str, "%H:%M").time()
                except ValueError:
                    print(f"❌ Navire rejeté - heure invalide: {heure_str} pour {nom_navire}")
                    rejected_count += 1
                    continue
        
        print(f"   - Navires rejetés détaillés: {rejected_count}")
        
        return {
            'success': True,
            'navires_ajoutes': navires_ajoutes,
            'total_traite': len(rows_data),
            'csv_file': csv_filename
        }
        
    except Exception as e:
        print(f"❌ Erreur lors du scraping: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
    finally:
        if driver:
            driver.quit()
            print("🔒 Navigateur fermé")

if __name__ == "__main__":
    result = scrape_navires_anp()
    print(f"Résultat: {result}") 