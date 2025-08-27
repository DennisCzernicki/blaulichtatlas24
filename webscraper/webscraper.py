import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.presseportal.de"
TARGET_URL = f"{BASE_URL}/blaulicht/d/polizei"
HEADERS = {"User-Agent": "Mozilla/5.0"}


def scrape_police_news():
    """Scrape latest police reports from presseportal.de."""
    response = requests.get(TARGET_URL, headers=HEADERS, timeout=10)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "lxml")

    for article in soup.select("article.news"):
        date = article.select_one(".date").get_text(strip=True)
        location_tag = article.select_one(".news-topic")
        location = location_tag.get_text(strip=True) if location_tag else ""

        headline_tag = article.select_one("h3.news-headline-clamp a")
        headline = headline_tag.get_text(strip=True)
        link = headline_tag["href"]
        if link.startswith("/"):
            link = BASE_URL + link

        agency_tag = article.select_one("p.customer a")
        agency = agency_tag.get_text(strip=True) if agency_tag else ""

        # second paragraph usually contains the summary
        paragraphs = article.find_all("p")
        summary = paragraphs[1].get_text(strip=True) if len(paragraphs) > 1 else ""

        print(f"{date} | {location} | {agency}")
        print(headline)
        print(link)
        if summary:
            print(summary)
        print("-" * 80)


if __name__ == "__main__":
    scrape_police_news()
