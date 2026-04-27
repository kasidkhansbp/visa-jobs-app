"""
Node: email_classifier

Sends each email to LLM → classifies it.
Output: { company, role, status } where status is one of:
  applied | interview_scheduled | rejected | offer_received | not_a_job_email
"""
