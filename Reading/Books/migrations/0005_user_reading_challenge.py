# Generated by Django 4.0.6 on 2022-08-02 10:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Books', '0004_alter_user_book_book_isbn'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='reading_challenge',
            field=models.IntegerField(default=10),
        ),
    ]