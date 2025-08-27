from bs4 import BeautifulSoup
import requests

html_text = requests.get('https://www.presseportal.de/blaulicht/').text

soup = BeautifulSoup(html_text, 'lxml')

case = soup.find_all('li', class_='article-list row')

print(case)