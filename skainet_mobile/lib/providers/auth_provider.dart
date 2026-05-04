import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  User? _currentUser;
  List<User> _allUsers = [];
  bool _loading = false;

  User? get currentUser => _currentUser;
  List<User> get allUsers => _allUsers;
  bool get loading => _loading;
  bool get isLoggedIn => _currentUser != null;
  bool get isAdmin => _currentUser?.isAdmin ?? false;

  List<User> get workers => _allUsers.where((u) => !u.isAdmin).toList();
  List<User> get admins => _allUsers.where((u) => u.isAdmin).toList();
  List<User> get joyeros => _allUsers.where((u) => u.isJoyero).toList();
  List<User> get availableJoyeros =>
      joyeros.where((u) => u.status == 'Disponible').toList();

  Future<void> fetchUsers() async {
    try {
      _allUsers = await _api.fetchUsers();
      if (_currentUser != null) {
        final updated = _allUsers.where((u) => u.id == _currentUser!.id).firstOrNull;
        if (updated != null) _currentUser = updated;
      }
      notifyListeners();
    } catch (_) {}
  }

  Future<bool> login(String id, String password) async {
    _loading = true;
    notifyListeners();
    try {
      final user = await _api.login(id, password);
      if (user != null) {
        _currentUser = user;
        _loading = false;
        notifyListeners();
        return true;
      }
    } catch (_) {}
    _loading = false;
    notifyListeners();
    return false;
  }

  void logout() {
    _currentUser = null;
    notifyListeners();
  }

  Future<void> updateStatus(String status) async {
    if (_currentUser == null) return;
    _loading = true;
    notifyListeners();
    try {
      final user = await _api.updateStatus(_currentUser!.id, status);
      if (user != null) _currentUser = user;
      await fetchUsers();
    } catch (_) {}
    _loading = false;
    notifyListeners();
  }

  String? getUserName(String id) {
    return _allUsers.where((u) => u.id == id).firstOrNull?.name;
  }
}
