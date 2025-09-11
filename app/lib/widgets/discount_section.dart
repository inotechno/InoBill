import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/discount.dart';

class DiscountSection extends StatefulWidget {
  final Discount discount;
  final Function(Discount) onUpdateDiscount;

  const DiscountSection({
    super.key,
    required this.discount,
    required this.onUpdateDiscount,
  });

  @override
  State<DiscountSection> createState() => _DiscountSectionState();
}

class _DiscountSectionState extends State<DiscountSection> {
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _percentageController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _updateControllers();
  }

  @override
  void didUpdateWidget(DiscountSection oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.discount != widget.discount) {
      _updateControllers();
    }
  }

  void _updateControllers() {
    _amountController.text = widget.discount.amount > 0 ? widget.discount.amount.toStringAsFixed(0) : '';
    _percentageController.text = widget.discount.percentage > 0 ? widget.discount.percentage.toStringAsFixed(1) : '';
  }

  @override
  void dispose() {
    _amountController.dispose();
    _percentageController.dispose();
    super.dispose();
  }

  void _updateDiscount() {
    final amount = double.tryParse(_amountController.text) ?? 0;
    final percentage = double.tryParse(_percentageController.text) ?? 0;
    
    widget.onUpdateDiscount(Discount(
      amount: amount,
      percentage: percentage,
      type: widget.discount.type,
    ));
  }

  void _onAmountChanged(String value) {
    if (value.isNotEmpty) {
      _percentageController.clear();
    }
    _updateDiscount();
  }

  void _onPercentageChanged(String value) {
    if (value.isNotEmpty) {
      _amountController.clear();
    }
    _updateDiscount();
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
                    color: Theme.of(context).colorScheme.tertiaryContainer,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.discount,
                    color: Theme.of(context).colorScheme.onTertiaryContainer,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Diskon',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            
            // Discount type
            DropdownButtonFormField<String>(
              value: widget.discount.type,
              decoration: const InputDecoration(
                labelText: 'Tipe Diskon',
                prefixIcon: Icon(Icons.category),
              ),
              items: const [
                DropdownMenuItem(
                  value: 'menu',
                  child: Text('Hanya dari Total Menu'),
                ),
                DropdownMenuItem(
                  value: 'total-bill',
                  child: Text('Dari Total Semua'),
                ),
              ],
              onChanged: (value) {
                if (value != null) {
                  widget.onUpdateDiscount(Discount(
                    amount: widget.discount.amount,
                    percentage: widget.discount.percentage,
                    type: value,
                  ));
                }
              },
            ),
            
            const SizedBox(height: 16),
            
            // Discount amount and percentage
            isTablet 
              ? Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _amountController,
                        decoration: InputDecoration(
                          labelText: 'Diskon (Rp)',
                          hintText: '10000',
                          prefixIcon: const Icon(Icons.attach_money),
                          suffixIcon: _amountController.text.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(Icons.clear),
                                  onPressed: () {
                                    _amountController.clear();
                                    _updateDiscount();
                                  },
                                )
                              : null,
                        ),
                        keyboardType: TextInputType.number,
                        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                        onChanged: _onAmountChanged,
                        enabled: _percentageController.text.isEmpty,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextField(
                        controller: _percentageController,
                        decoration: InputDecoration(
                          labelText: 'Diskon (%)',
                          hintText: '10',
                          prefixIcon: const Icon(Icons.percent),
                          suffixIcon: _percentageController.text.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(Icons.clear),
                                  onPressed: () {
                                    _percentageController.clear();
                                    _updateDiscount();
                                  },
                                )
                              : null,
                        ),
                        keyboardType: TextInputType.number,
                        inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9.]'))],
                        onChanged: _onPercentageChanged,
                        enabled: _amountController.text.isEmpty,
                      ),
                    ),
                  ],
                )
              : Column(
                  children: [
                    TextField(
                      controller: _amountController,
                      decoration: InputDecoration(
                        labelText: 'Diskon (Rp)',
                        hintText: '10000',
                        prefixIcon: const Icon(Icons.attach_money),
                        suffixIcon: _amountController.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear),
                                onPressed: () {
                                  _amountController.clear();
                                  _updateDiscount();
                                },
                              )
                            : null,
                      ),
                      keyboardType: TextInputType.number,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      onChanged: _onAmountChanged,
                      enabled: _percentageController.text.isEmpty,
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _percentageController,
                      decoration: InputDecoration(
                        labelText: 'Diskon (%)',
                        hintText: '10',
                        prefixIcon: const Icon(Icons.percent),
                        suffixIcon: _percentageController.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear),
                                onPressed: () {
                                  _percentageController.clear();
                                  _updateDiscount();
                                },
                              )
                            : null,
                      ),
                      keyboardType: TextInputType.number,
                      inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9.]'))],
                      onChanged: _onPercentageChanged,
                      enabled: _amountController.text.isEmpty,
                    ),
                  ],
                ),
            
            // Info message
            if (_amountController.text.isNotEmpty || _percentageController.text.isNotEmpty)
              Container(
                margin: const EdgeInsets.only(top: 8),
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.info_outline,
                      size: 16,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _amountController.text.isNotEmpty
                            ? 'Diskon dalam bentuk nominal (Rp)'
                            : 'Diskon dalam bentuk persentase (%)',
                        style: TextStyle(
                          fontSize: 12,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
