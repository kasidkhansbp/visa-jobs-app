"""
Node: gmail_reader

Fetches new emails from Gmail since the last check using a single OR query.
Query:
  subject:("thank you for applying" OR "thanks for applying" OR "your application" OR
           "we received your application" OR "application received" OR
           "application confirmation") after:YYYY/MM/DD

Output: list of { email_id, subject, body, sender, received_at }
"""
