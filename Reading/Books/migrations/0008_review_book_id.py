# Generated by Django 4.0.6 on 2022-08-07 13:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Books', '0007_remove_review_book_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='review',
            name='book_id',
            field=models.TextField(default=1),
            preserve_default=False,
        ),
    ]
