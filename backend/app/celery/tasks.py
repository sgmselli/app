from app.celery import celery_task_queue
from app.utils.email import EmailHandler

@celery_task_queue.task(name="task_send_payment_success_to_supporter_email")
def task_send_payment_success_to_supporter_email(to_email: str, display_name: str, amount: str, currency: str):
    EmailHandler().send_payment_success_to_supporter_email(to_email, display_name, amount, currency)
    print(f"Sent send_payment_success_to_supporter_email to {to_email}")

@celery_task_queue.task(name="task_send_payment_success_to_creator_email")
def task_send_payment_success_to_creator_email(to_email: str, display_name: str, supporter_email: str, amount: str, currency: str):
    EmailHandler().send_payment_success_to_creator_email(to_email, display_name, supporter_email, amount, currency)
    print(f"Sent send_payment_success_to_creator_email to {to_email}")