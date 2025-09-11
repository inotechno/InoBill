import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/participant.dart';
import '../models/menu_item.dart';
import '../models/additional_cost.dart';
import '../models/discount.dart';
import '../models/split_result.dart';
import '../services/split_calculator.dart';
import '../widgets/participant_section.dart';
import '../widgets/menu_section.dart';
import '../widgets/additional_cost_section.dart';
import '../widgets/order_section.dart';
import '../widgets/discount_section.dart';
import '../widgets/result_section.dart';

class SplitBillScreen extends StatefulWidget {
  const SplitBillScreen({super.key});

  @override
  State<SplitBillScreen> createState() => _SplitBillScreenState();
}

class _SplitBillScreenState extends State<SplitBillScreen> {
  final List<Participant> _participants = [];
  final List<MenuItem> _menuItems = [];
  final List<AdditionalCost> _additionalCosts = [];
  final Map<String, List<String>> _orders = {};
  Discount _discount = const Discount();
  SplitResult? _result;

  @override
  void initState() {
    super.initState();
    _initializeData();
  }

  void _initializeData() {
    // Initialize with empty data
    setState(() {
      _participants.clear();
      _menuItems.clear();
      _additionalCosts.clear();
      _orders.clear();
      _discount = const Discount();
      _result = null;
    });
  }

  void _addParticipant(String name) {
    if (name.isNotEmpty && !_participants.any((p) => p.name == name)) {
      setState(() {
        _participants.add(Participant(name: name));
        _orders[name] = [];
      });
    }
  }

  void _removeParticipant(String name) {
    setState(() {
      _participants.removeWhere((p) => p.name == name);
      _orders.remove(name);
    });
  }

  void _addMenuItem(String name, double price) {
    if (name.isNotEmpty && !_menuItems.any((m) => m.name == name)) {
      setState(() {
        _menuItems.add(MenuItem(name: name, price: price));
      });
    }
  }

  void _removeMenuItem(String name) {
    setState(() {
      _menuItems.removeWhere((m) => m.name == name);
      // Remove from all orders
      for (final participantName in _orders.keys) {
        _orders[participantName]!.remove(name);
      }
    });
  }

  void _addAdditionalCost(String name, double amount, String type) {
    if (name.isNotEmpty && !_additionalCosts.any((c) => c.name == name)) {
      setState(() {
        _additionalCosts.add(AdditionalCost(name: name, amount: amount, type: type));
      });
    }
  }

  void _removeAdditionalCost(String name) {
    setState(() {
      _additionalCosts.removeWhere((c) => c.name == name);
    });
  }

  void _updateOrder(String participantName, List<String> orders) {
    setState(() {
      _orders[participantName] = orders;
    });
  }

  void _updateDiscount(Discount discount) {
    setState(() {
      _discount = discount;
    });
  }

  void _calculateSplit() {
    if (_participants.isEmpty || _menuItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tambahkan minimal 1 peserta dan 1 menu untuk menghitung'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    final result = SplitCalculator.calculateSplit(
      participants: _participants.map((p) => p.name).toList(),
      menuItems: _menuItems,
      additionalCosts: _additionalCosts,
      orders: _orders,
      discount: _discount,
    );

    setState(() {
      _result = result;
    });

    // Scroll to results
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Scrollable.ensureVisible(
        context,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isTablet = screenWidth > 768;
    final isDesktop = screenWidth > 1024;
    
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(
              'icon.png',
              height: 32,
              width: 32,
              errorBuilder: (context, error, stackTrace) {
                return Icon(
                  Icons.calculate,
                  color: Theme.of(context).colorScheme.primary,
                );
              },
            ),
            const SizedBox(width: 12),
            const Text(
              'Split Bill Calculator',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
        foregroundColor: Theme.of(context).colorScheme.onPrimaryContainer,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _initializeData,
            tooltip: 'Reset Data',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(isTablet ? 24 : 16),
        child: isDesktop 
          ? _buildDesktopLayout()
          : isTablet 
            ? _buildTabletLayout()
            : _buildMobileLayout(),
      ),
    );
  }

  Widget _buildMobileLayout() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Participants Section
        ParticipantSection(
          participants: _participants,
          onAddParticipant: _addParticipant,
          onRemoveParticipant: _removeParticipant,
        ),
        
        const SizedBox(height: 16),
        
        // Menu Section
        MenuSection(
          menuItems: _menuItems,
          onAddMenuItem: _addMenuItem,
          onRemoveMenuItem: _removeMenuItem,
        ),
        
        const SizedBox(height: 16),
        
        // Additional Costs Section
        AdditionalCostSection(
          additionalCosts: _additionalCosts,
          onAddAdditionalCost: _addAdditionalCost,
          onRemoveAdditionalCost: _removeAdditionalCost,
        ),
        
        const SizedBox(height: 16),
        
        // Discount Section
        DiscountSection(
          discount: _discount,
          onUpdateDiscount: _updateDiscount,
        ),
        
        const SizedBox(height: 16),
        
        // Orders Section
        OrderSection(
          participants: _participants,
          menuItems: _menuItems,
          orders: _orders,
          onUpdateOrder: _updateOrder,
        ),
        
        const SizedBox(height: 24),
        
        // Calculate Button
        ElevatedButton.icon(
          onPressed: _calculateSplit,
          icon: const Icon(Icons.calculate),
          label: const Text(
            'Hitung Split Bill',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: Theme.of(context).colorScheme.primary,
            foregroundColor: Theme.of(context).colorScheme.onPrimary,
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
        ),
        
        const SizedBox(height: 24),
        
        // Results Section
        if (_result != null)
          ResultSection(
            result: _result!,
            menuItems: _menuItems,
            additionalCosts: _additionalCosts,
            discount: _discount,
          ),
      ],
    );
  }

  Widget _buildTabletLayout() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Top row: Participants and Menu
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ParticipantSection(
                participants: _participants,
                onAddParticipant: _addParticipant,
                onRemoveParticipant: _removeParticipant,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: MenuSection(
                menuItems: _menuItems,
                onAddMenuItem: _addMenuItem,
                onRemoveMenuItem: _removeMenuItem,
              ),
            ),
          ],
        ),
        
        const SizedBox(height: 16),
        
        // Middle row: Additional Costs and Discount
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: AdditionalCostSection(
                additionalCosts: _additionalCosts,
                onAddAdditionalCost: _addAdditionalCost,
                onRemoveAdditionalCost: _removeAdditionalCost,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: DiscountSection(
                discount: _discount,
                onUpdateDiscount: _updateDiscount,
              ),
            ),
          ],
        ),
        
        const SizedBox(height: 16),
        
        // Orders Section (full width)
        OrderSection(
          participants: _participants,
          menuItems: _menuItems,
          orders: _orders,
          onUpdateOrder: _updateOrder,
        ),
        
        const SizedBox(height: 24),
        
        // Calculate Button
        ElevatedButton.icon(
          onPressed: _calculateSplit,
          icon: const Icon(Icons.calculate),
          label: const Text(
            'Hitung Split Bill',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: Theme.of(context).colorScheme.primary,
            foregroundColor: Theme.of(context).colorScheme.onPrimary,
            padding: const EdgeInsets.symmetric(vertical: 20),
            minimumSize: const Size(double.infinity, 56),
          ),
        ),
        
        const SizedBox(height: 24),
        
        // Results Section
        if (_result != null)
          ResultSection(
            result: _result!,
            menuItems: _menuItems,
            additionalCosts: _additionalCosts,
            discount: _discount,
          ),
      ],
    );
  }

  Widget _buildDesktopLayout() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Top row: All input sections
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                children: [
                  ParticipantSection(
                    participants: _participants,
                    onAddParticipant: _addParticipant,
                    onRemoveParticipant: _removeParticipant,
                  ),
                  const SizedBox(height: 16),
                  MenuSection(
                    menuItems: _menuItems,
                    onAddMenuItem: _addMenuItem,
                    onRemoveMenuItem: _removeMenuItem,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                children: [
                  AdditionalCostSection(
                    additionalCosts: _additionalCosts,
                    onAddAdditionalCost: _addAdditionalCost,
                    onRemoveAdditionalCost: _removeAdditionalCost,
                  ),
                  const SizedBox(height: 16),
                  DiscountSection(
                    discount: _discount,
                    onUpdateDiscount: _updateDiscount,
                  ),
                ],
              ),
            ),
          ],
        ),
        
        const SizedBox(height: 20),
        
        // Orders Section (full width)
        OrderSection(
          participants: _participants,
          menuItems: _menuItems,
          orders: _orders,
          onUpdateOrder: _updateOrder,
        ),
        
        const SizedBox(height: 24),
        
        // Calculate Button
        ElevatedButton.icon(
          onPressed: _calculateSplit,
          icon: const Icon(Icons.calculate, size: 24),
          label: const Text(
            'Hitung Split Bill',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: Theme.of(context).colorScheme.primary,
            foregroundColor: Theme.of(context).colorScheme.onPrimary,
            padding: const EdgeInsets.symmetric(vertical: 24),
            minimumSize: const Size(double.infinity, 64),
          ),
        ),
        
        const SizedBox(height: 24),
        
        // Results Section
        if (_result != null)
          ResultSection(
            result: _result!,
            menuItems: _menuItems,
            additionalCosts: _additionalCosts,
            discount: _discount,
          ),
      ],
    );
  }
}
