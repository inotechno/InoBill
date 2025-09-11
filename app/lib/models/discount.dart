class Discount {
  final double amount;
  final double percentage;
  final String type; // 'menu' or 'total-bill'

  const Discount({
    this.amount = 0,
    this.percentage = 0,
    this.type = 'menu',
  });

  Discount copyWith({
    double? amount,
    double? percentage,
    String? type,
  }) {
    return Discount(
      amount: amount ?? this.amount,
      percentage: percentage ?? this.percentage,
      type: type ?? this.type,
    );
  }

  bool get hasAmount => amount > 0;
  bool get hasPercentage => percentage > 0;
  bool get hasDiscount => hasAmount || hasPercentage;

  Map<String, dynamic> toJson() {
    return {
      'amount': amount,
      'percentage': percentage,
      'type': type,
    };
  }

  factory Discount.fromJson(Map<String, dynamic> json) {
    return Discount(
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
      percentage: (json['percentage'] as num?)?.toDouble() ?? 0,
      type: json['type'] ?? 'menu',
    );
  }

  @override
  String toString() => 'Discount(amount: $amount, percentage: $percentage, type: $type)';
}
