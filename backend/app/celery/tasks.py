from app.celery import celery_task_queue
from app.utils.email import EmailHandler

@celery_task_queue.task(name="task_send_payment_success_email")
def task_send_payment_success_email(to_email: str, display_name: str, amount: str, currency: str):
    EmailHandler().send_payment_success_email(to_email, display_name, amount, currency)
    print(f"Sent email to {to_email}: {display_name} donated {amount} {currency}")