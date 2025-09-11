import 'package:intl/intl.dart';

class SplitResult {
  final Map<String, double> participantAmounts;
  final double totalFoodCost;
  final double totalAdditionalCosts;
  final double totalDiscount;
  final double grandTotal;
  final double factor;
  final Map<String, double> adjustedMenuPrices;
  final String discountType;

  SplitResult({
    required this.participantAmounts,
    required this.totalFoodCost,
    required this.totalAdditionalCosts,
    required this.totalDiscount,
    required this.grandTotal,
    required this.factor,
    required this.adjustedMenuPrices,
    required this.discountType,
  });

  String get formattedGrandTotal => NumberFormat.currency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 0,
  ).format(grandTotal);

  String formatCurrency(double amount) => NumberFormat.currency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 0,
  ).format(amount);

  @override
  String toString() => 'SplitResult(grandTotal: $grandTotal, factor: $factor)';
}
