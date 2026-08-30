from math import asin, cos, radians, sin, sqrt


def distancia_km(lat1, lng1, lat2, lng2):
    """Distancia entre dos puntos (fórmula de Haversine). Suficiente
    para un MVP; si el catálogo crece mucho, esto se movería a una
    consulta espacial en PostGIS en vez de calcularse en Python."""
    if None in (lat1, lng1, lat2, lng2):
        return None
    r = 6371  # radio de la Tierra en km
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    return round(2 * r * asin(sqrt(a)), 1)
