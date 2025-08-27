import json
from datetime import datetime

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.presseportal.de"
TARGET_URL = f"{BASE_URL}/blaulicht/d/polizei"
HEADERS = {"User-Agent": "Mozilla/5.0"}


def geocode_location(location: str):
    """Return latitude and longitude for a location string using Nominatim."""
    if not location:
        return None, None
    try:
        params = {"q": f"{location}, Germany", "format": "json", "limit": 1}
        resp = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params=params,
            headers=HEADERS,
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        if data:
            return float(data[0]["lat"]), float(data[0]["lon"])
    except Exception:
        pass
    return None, None


def scrape_police_news():
    """Scrape latest police reports from presseportal.de and return structured data."""
    response = requests.get(TARGET_URL, headers=HEADERS, timeout=10)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "lxml")

    incidents = []
    for idx, article in enumerate(soup.select("article.news"), start=1):
        if idx > 10:
            break
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

        paragraphs = article.find_all("p")
        summary = paragraphs[1].get_text(strip=True) if len(paragraphs) > 1 else ""

        # Parse date string to ISO format
        try:
            dt = datetime.strptime(date, "%d.%m.%Y – %H:%M")
            iso_date = dt.isoformat()
        except Exception:
            iso_date = datetime.utcnow().isoformat()

        lat, lng = geocode_location(location)

        incidents.append(
            {
                "date": iso_date,
                "location": location,
                "agency": agency,
                "headline": headline,
                "link": link,
                "summary": summary,
                "coordinates": {"lat": lat, "lng": lng} if lat and lng else None,
            }
        )

    return incidents


if __name__ == "__main__":
    print(json.dumps(scrape_police_news(), ensure_ascii=False))
