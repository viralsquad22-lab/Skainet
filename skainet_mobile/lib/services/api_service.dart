import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/models.dart';

class ApiService {
  // ── Users ──
  Future<List<User>> fetchUsers() async {
    final resp = await http.get(Uri.parse('$apiBaseUrl/users'));
    final data = jsonDecode(resp.body) as List;
    return data.map((j) => User.fromJson(j)).toList();
  }

  Future<User?> login(String id, String password) async {
    final resp = await http.post(
      Uri.parse('$apiBaseUrl/users/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'id': id, 'password': password}),
    );
    if (resp.statusCode == 200 || resp.statusCode == 201) {
      return User.fromJson(jsonDecode(resp.body));
    }
    return null;
  }

  Future<User?> updateStatus(String id, String status) async {
    final resp = await http.patch(
      Uri.parse('$apiBaseUrl/users/$id/status'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'status': status}),
    );
    if (resp.statusCode == 200) return User.fromJson(jsonDecode(resp.body));
    return null;
  }

  // ── Batches ──
  Future<List<Batch>> fetchBatches() async {
    final resp = await http.get(Uri.parse('$apiBaseUrl/batches'));
    final data = jsonDecode(resp.body) as List;
    return data.map((j) => Batch.fromJson(j)).toList();
  }

  Future<void> createBatch(double entryWeight, double exitWeight, int ringsCount) async {
    await http.post(
      Uri.parse('$apiBaseUrl/batches'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'entryWeight': entryWeight,
        'exitWeight': exitWeight,
        'ringsCount': ringsCount,
      }),
    );
  }

  Future<List<Ring>> fetchPendingRings() async {
    final resp = await http.get(Uri.parse('$apiBaseUrl/batches/pending-rings'));
    final data = jsonDecode(resp.body) as List;
    return data.map((j) => Ring.fromJson(j)).toList();
  }

  // ── Orders ──
  Future<List<WorkOrder>> fetchOrders() async {
    final resp = await http.get(Uri.parse('$apiBaseUrl/orders'));
    final data = jsonDecode(resp.body) as List;
    return data.map((j) => WorkOrder.fromJson(j)).toList();
  }

  Future<Map<String, dynamic>> createOrder({
    required String ringId,
    required String receiverId,
    required String executorId,
    required Map<String, double> weights,
    String? providedPin,
  }) async {
    final resp = await http.post(
      Uri.parse('$apiBaseUrl/orders'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'ringId': ringId,
        'receiverId': receiverId,
        'executorId': executorId,
        'weights': weights,
        'providedPin': providedPin,
      }),
    );
    if (resp.statusCode >= 400) {
      final err = jsonDecode(resp.body);
      throw Exception(err['message'] ?? 'Error en despacho');
    }
    return jsonDecode(resp.body);
  }

  Future<Map<String, dynamic>> closeOrder({
    required String orderId,
    required Map<String, double> weights,
    String? explanation,
    String? providedPin,
  }) async {
    final resp = await http.post(
      Uri.parse('$apiBaseUrl/orders/$orderId/close'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'weights': weights,
        'explanation': explanation,
        'providedPin': providedPin,
      }),
    );
    if (resp.statusCode >= 400) {
      final err = jsonDecode(resp.body);
      throw Exception(err['message'] ?? 'Error al cerrar orden');
    }
    return jsonDecode(resp.body);
  }

  // ── Client Orders ──
  Future<List<ClientOrder>> fetchClientOrders() async {
    final resp = await http.get(Uri.parse('$apiBaseUrl/client-orders'));
    final data = jsonDecode(resp.body) as List;
    return data.map((j) => ClientOrder.fromJson(j)).toList();
  }

  Future<ClientOrder> createClientOrder({
    required String clientName,
    required String design,
    required double estimatedWeight,
    String? email,
    String? phone,
  }) async {
    final resp = await http.post(
      Uri.parse('$apiBaseUrl/client-orders'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'clientName': clientName,
        'design': design,
        'estimatedWeight': estimatedWeight,
        'email': email,
        'phone': phone,
      }),
    );
    return ClientOrder.fromJson(jsonDecode(resp.body));
  }

  Future<void> updateClientOrderStatus(String id, String status, int stepIndex) async {
    await http.patch(
      Uri.parse('$apiBaseUrl/client-orders/$id/status'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'status': status, 'stepIndex': stepIndex}),
    );
  }

  // ── Alerts & Stats ──
  Future<List<Alert>> fetchAlerts() async {
    final resp = await http.get(Uri.parse('$apiBaseUrl/alerts'));
    final data = jsonDecode(resp.body) as List;
    return data.map((j) => Alert.fromJson(j)).toList();
  }

  Future<WorkshopStats> fetchStats() async {
    final resp = await http.get(Uri.parse('$apiBaseUrl/stats'));
    return WorkshopStats.fromJson(jsonDecode(resp.body));
  }
}
