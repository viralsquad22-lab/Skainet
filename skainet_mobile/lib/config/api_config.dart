import 'package:flutter/foundation.dart' show kIsWeb;

// En emulador Android usa 10.0.2.2 para acceder al host.
// En web (Chrome) usa localhost directamente.
final String apiBaseUrl = kIsWeb ? 'http://localhost:3000' : 'http://10.0.2.2:3000';
