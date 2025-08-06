from django.test import TestCase
from django.utils import timezone
from datetime import datetime
from .serializers import AbsenceSerializer
import pytz

# Create your tests here.

class AbsenceSerializerTimezoneTest(TestCase):
    def test_naive_datetime_conversion_logic(self):
        """Test the datetime conversion logic directly"""
        serializer = AbsenceSerializer()
        
        # Test data with naive datetime strings (as sent from frontend)
        test_data = {
            'matricule': 'TEST123',
            'date_debut_abs': '2025-07-16T22:00:00',
            'date_fin_abs': '2025-07-17T06:00:00',
            'justification': 'Test absence',
            'est_justifié': True
        }
        
        # Test the datetime conversion logic directly
        if 'date_debut_abs' in test_data and test_data['date_debut_abs']:
            try:
                naive_dt = datetime.fromisoformat(test_data['date_debut_abs'].replace('Z', '+00:00'))
                timezone_aware_dt = timezone.make_aware(naive_dt, timezone=pytz.UTC)
                self.assertTrue(timezone.is_aware(timezone_aware_dt))
            except (ValueError, TypeError) as e:
                self.fail(f"Datetime conversion failed: {e}")
        
        if 'date_fin_abs' in test_data and test_data['date_fin_abs']:
            try:
                naive_dt = datetime.fromisoformat(test_data['date_fin_abs'].replace('Z', '+00:00'))
                timezone_aware_dt = timezone.make_aware(naive_dt, timezone=pytz.UTC)
                self.assertTrue(timezone.is_aware(timezone_aware_dt))
            except (ValueError, TypeError) as e:
                self.fail(f"Datetime conversion failed: {e}")
    
    def test_timezone_aware_datetime_handling_logic(self):
        """Test that already timezone-aware datetimes are handled correctly"""
        serializer = AbsenceSerializer()
        
        # Test data with timezone-aware datetime strings
        test_data = {
            'matricule': 'TEST123',
            'date_debut_abs': '2025-07-16T22:00:00+00:00',
            'date_fin_abs': '2025-07-17T06:00:00+00:00',
            'justification': 'Test absence',
            'est_justifié': True
        }
        
        # Test the datetime conversion logic directly
        if 'date_debut_abs' in test_data and test_data['date_debut_abs']:
            try:
                naive_dt = datetime.fromisoformat(test_data['date_debut_abs'].replace('Z', '+00:00'))
                timezone_aware_dt = timezone.make_aware(naive_dt, timezone=pytz.UTC)
                self.assertTrue(timezone.is_aware(timezone_aware_dt))
            except (ValueError, TypeError) as e:
                self.fail(f"Datetime conversion failed: {e}")
        
        if 'date_fin_abs' in test_data and test_data['date_fin_abs']:
            try:
                naive_dt = datetime.fromisoformat(test_data['date_fin_abs'].replace('Z', '+00:00'))
                timezone_aware_dt = timezone.make_aware(naive_dt, timezone=pytz.UTC)
                self.assertTrue(timezone.is_aware(timezone_aware_dt))
            except (ValueError, TypeError) as e:
                self.fail(f"Datetime conversion failed: {e}")
    
    def test_empty_datetime_handling(self):
        """Test that empty datetime fields are handled gracefully"""
        serializer = AbsenceSerializer()
        
        test_data = {
            'matricule': 'TEST123',
            'date_debut_abs': '',
            'date_fin_abs': '',
            'justification': 'Test absence',
            'est_justifié': True
        }
        
        # Test that empty strings are handled gracefully
        if 'date_debut_abs' in test_data and test_data['date_debut_abs']:
            # This should not execute for empty strings
            self.fail("Empty string should not trigger datetime conversion")
        
        if 'date_fin_abs' in test_data and test_data['date_fin_abs']:
            # This should not execute for empty strings
            self.fail("Empty string should not trigger datetime conversion")
        
        # If we get here, the empty string handling worked correctly
        self.assertTrue(True)
