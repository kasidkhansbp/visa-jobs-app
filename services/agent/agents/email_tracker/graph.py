"""
Email Tracker Agent — Planner.

Conditional routing:
  START → gmail_reader → email_classifier
                               ↓
                       is it a job email?
                       YES → status_writer → END
                       NO  → END
"""
