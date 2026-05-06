import 'package:flutter/foundation.dart' show kIsWeb;

// En web (Chrome) usa localhost.
// En móvil real usa la IP de tu PC en la red local.
// Asegúrate de estar conectado a la misma red WiFi.
final String apiBaseUrl = kIsWeb ? 'http://localhost:3000' : 'http://10.1.196.189:3000';
