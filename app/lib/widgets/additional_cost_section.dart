import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/additional_cost.dart';

class AdditionalCostSection extends StatefulWidget {
  final List<AdditionalCost> additionalCosts;
  final Function(String, double, String) onAddAdditionalCost;
  final Function(String) onRemoveAdditionalCost;

  const AdditionalCostSection({
    super.key,
    required this.additionalCosts,
    required this.onAddAdditionalCost,
    required this.onRemoveAdditionalCost,
  });

  @override
  State<AdditionalCostSection> createState() => _AdditionalCostSectionState();
}

class _AdditionalCostSectionState extends State<AdditionalCostSection> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  String _selectedType = 'fixed';

  @override
  void dispose() {
    _nameController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  void _addAdditionalCost() {
    final name = _nameController.text.trim();
    final amountText = _amountController.text.trim();
    
    if (name.isNotEmpty && amountText.isNotEmpty) {
      final amount = double.tryParse(amountText);
      if (amount != null && amount > 0) {
        widget.onAddAdditionalCost(name, amount, _selectedType);
        _nameController.clear();
        _amountController.clear();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Jumlah harus berupa angka yang valid'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isTablet = screenWidth > 768;
    
    return Card(
      child: Padding(
        padding: EdgeInsets.all(isTablet ? 20 : 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.secondaryContainer,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.receipt_long,
                    color: Theme.of(context).colorScheme.onSecondaryContainer,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Biaya Tambahan',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            
            // Add additional cost input
            isTablet 
              ? Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          flex: 2,
                          child: TextField(
                            controller: _nameController,
                            decoration: const InputDecoration(
                              labelText: 'Nama Biaya',
                              hintText: 'Contoh: Parkir, PPN, Layanan',
                              prefixIcon: Icon(Icons.receipt),
                            ),
                            onSubmitted: (_) => _addAdditionalCost(),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: _amountController,
                            decoration: InputDecoration(
                              labelText: _selectedType == 'fixed' ? 'Jumlah (Rp)' : 'Persentase (%)',
                              hintText: _selectedType == 'fixed' ? '5000' : '10',
                              prefixIcon: Icon(_selectedType == 'fixed' ? Icons.attach_money : Icons.percent),
                            ),
                            keyboardType: TextInputType.number,
                            inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9.]'))],
                            onSubmitted: (_) => _addAdditionalCost(),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: _selectedType,
                            decoration: const InputDecoration(
                              labelText: 'Tipe Biaya',
                              prefixIcon: Icon(Icons.category),
                            ),
                            items: const [
                              DropdownMenuItem(
                                value: 'fixed',
                                child: Text('Tetap (Rp)'),
                              ),
                              DropdownMenuItem(
                                value: 'percentage',
                                child: Text('Persentase (%)'),
                              ),
                            ],
                            onChanged: (value) {
                              setState(() {
                                _selectedType = value ?? 'fixed';
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        ElevatedButton.icon(
                          onPressed: _addAdditionalCost,
                          icon: const Icon(Icons.add),
                          label: const Text('Tambah'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                        ),
                      ],
                    ),
                  ],
                )
              : Column(
                  children: [
                    TextField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Nama Biaya',
                        hintText: 'Contoh: Parkir, PPN, Layanan',
                        prefixIcon: Icon(Icons.receipt),
                      ),
                      onSubmitted: (_) => _addAdditionalCost(),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _amountController,
                            decoration: InputDecoration(
                              labelText: _selectedType == 'fixed' ? 'Jumlah (Rp)' : 'Persentase (%)',
                              hintText: _selectedType == 'fixed' ? '5000' : '10',
                              prefixIcon: Icon(_selectedType == 'fixed' ? Icons.attach_money : Icons.percent),
                            ),
                            keyboardType: TextInputType.number,
                            inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9.]'))],
                            onSubmitted: (_) => _addAdditionalCost(),
                          ),
                        ),
                        const SizedBox(width: 12),
                        ElevatedButton.icon(
                          onPressed: _addAdditionalCost,
                          icon: const Icon(Icons.add),
                          label: const Text('Tambah'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: _selectedType,
                      decoration: const InputDecoration(
                        labelText: 'Tipe Biaya',
                        prefixIcon: Icon(Icons.category),
                      ),
                      items: const [
                        DropdownMenuItem(
                          value: 'fixed',
                          child: Text('Tetap (Rp)'),
                        ),
                        DropdownMenuItem(
                          value: 'percentage',
                          child: Text('Persentase (%)'),
                        ),
                      ],
                      onChanged: (value) {
                        setState(() {
                          _selectedType = value ?? 'fixed';
                        });
                      },
                    ),
                  ],
                ),
            
            const SizedBox(height: 16),
            
            // Additional costs list
            if (widget.additionalCosts.isEmpty)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  children: [
                    Icon(
                      Icons.receipt_outlined,
                      size: 48,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Belum ada biaya tambahan',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Tambahkan biaya tambahan untuk memulai',
                      style: TextStyle(
                        color: Colors.grey.shade500,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: widget.additionalCosts.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final cost = widget.additionalCosts[index];
                  return Container(
                    margin: const EdgeInsets.symmetric(vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      leading: CircleAvatar(
                        backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
                        child: Icon(
                          cost.type == 'fixed' ? Icons.attach_money : Icons.percent,
                          color: Theme.of(context).colorScheme.onSecondaryContainer,
                        ),
                      ),
                      title: Text(
                        cost.name,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      subtitle: Text(
                        cost.type == 'fixed' 
                          ? 'Rp ${cost.amount.toStringAsFixed(0).replaceAllMapped(
                              RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
                              (Match m) => '${m[1]}.',
                            )}'
                          : '${cost.amount.toStringAsFixed(1)}%',
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.secondary,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_outline, color: Colors.red),
                        onPressed: () => widget.onRemoveAdditionalCost(cost.name),
                        tooltip: 'Hapus biaya tambahan',
                      ),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
