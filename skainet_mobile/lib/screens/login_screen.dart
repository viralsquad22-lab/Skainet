import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../models/models.dart';
import '../providers/auth_provider.dart';
import '../providers/workshop_provider.dart';
import '../widgets/widgets.dart';
import 'admin/admin_dashboard.dart';
import 'joyero/joyero_dashboard.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  User? _selectedUser;
  final _passwordCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    context.read<AuthProvider>().fetchUsers();
  }

  void _selectUser(User user) => setState(() => _selectedUser = user);
  void _clearSelection() => setState(() { _selectedUser = null; _passwordCtrl.clear(); });

  Future<void> _login() async {
    if (_selectedUser == null || _passwordCtrl.text.isEmpty) return;
    final auth = context.read<AuthProvider>();
    final success = await auth.login(_selectedUser!.id, _passwordCtrl.text);
    if (!mounted) return;
    if (success) {
      context.read<WorkshopProvider>().startPolling();
      Navigator.pushReplacement(context, MaterialPageRoute(
        builder: (_) => auth.isAdmin ? const AdminDashboard() : const JoyeroDashboard(),
      ));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Contraseña incorrecta'), backgroundColor: AppColors.danger),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: RadialGradient(center: Alignment.topRight, radius: 1.5, colors: [Color(0xFF1A1A1A), Colors.black]),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: GlassCard(
              padding: const EdgeInsets.all(28),
              child: _selectedUser == null ? _buildUserSelection(auth) : _buildPasswordPhase(),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildUserSelection(AuthProvider auth) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Text('IDENTIFICACIÓN SKYNET',
          style: TextStyle(color: AppColors.gold, fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: 3),
        ),
        const SizedBox(height: 8),
        Text('Seleccione su perfil de acceso', style: TextStyle(color: AppColors.textMuted, fontSize: 14)),
        const SizedBox(height: 24),
        // Workers
        const Align(
          alignment: Alignment.centerLeft,
          child: Text('EQUIPO DE TALLER', style: TextStyle(color: AppColors.gold, fontSize: 11, letterSpacing: 1, fontWeight: FontWeight.w700)),
        ),
        const SizedBox(height: 10),
        ...auth.workers.map((u) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => _selectUser(u),
              icon: const Icon(Icons.account_circle, size: 18),
              label: Text(u.name),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.gold,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                textStyle: const TextStyle(fontWeight: FontWeight.w700, letterSpacing: 1),
              ),
            ),
          ),
        )),
        const Divider(color: Color(0xFF333333), height: 28),
        const Align(
          alignment: Alignment.centerLeft,
          child: Text('ADMINISTRACIÓN CENTRAL', style: TextStyle(color: AppColors.textMuted, fontSize: 11, letterSpacing: 1)),
        ),
        const SizedBox(height: 10),
        ...auth.admins.map((u) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => _selectUser(u),
              style: ElevatedButton.styleFrom(
                backgroundColor: u.name == 'Viralsquad' ? const Color(0xFF1A1A1A) : const Color(0xFF222222),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: BorderSide(color: u.name == 'Viralsquad' ? AppColors.gold : const Color(0xFF333333)),
                ),
                textStyle: const TextStyle(fontWeight: FontWeight.w700, letterSpacing: 1),
              ),
              child: Text(u.name == 'Viralsquad' ? 'PANEL SUPERIOR (${u.name})' : 'ADMINISTRADORA (${u.name})'),
            ),
          ),
        )),
      ],
    );
  }

  Widget _buildPasswordPhase() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 64, height: 64,
          decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: AppColors.gold, width: 2)),
          child: const Icon(Icons.account_circle, size: 40, color: AppColors.gold),
        ),
        const SizedBox(height: 12),
        Text(_selectedUser!.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
        Text(_selectedUser!.role, style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(color: Colors.black45, borderRadius: BorderRadius.circular(8)),
          child: TextField(
            controller: _passwordCtrl,
            obscureText: true,
            textAlign: TextAlign.center,
            autofocus: true,
            style: const TextStyle(fontSize: 20, letterSpacing: 4, color: Colors.white),
            decoration: const InputDecoration(border: InputBorder.none, hintText: 'Contraseña', hintStyle: TextStyle(color: Colors.white24)),
            onSubmitted: (_) => _login(),
          ),
        ),
        const SizedBox(height: 16),
        GoldButton(label: auth.loading ? 'Validando...' : 'INICIAR SESIÓN', onPressed: auth.loading ? null : _login),
        const SizedBox(height: 12),
        TextButton(
          onPressed: _clearSelection,
          child: const Text('Volver a selección de perfil', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
        ),
      ],
    );
  }

  AuthProvider get auth => context.read<AuthProvider>();

  @override
  void dispose() {
    _passwordCtrl.dispose();
    super.dispose();
  }
}
