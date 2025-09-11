class AdditionalCost {
  final String name;
  final double amount;
  final String type; // 'fixed' or 'percentage'

  AdditionalCost({
    required this.name,
    required this.amount,
    this.type = 'fixed',
  });

  AdditionalCost copyWith({
    String? name,
    double? amount,
    String? type,
  }) {
    return AdditionalCost(
      name: name ?? this.name,
      amount: amount ?? this.amount,
      type: type ?? this.type,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'amount': amount,
      'type': type,
    };
  }

  factory AdditionalCost.fromJson(Map<String, dynamic> json) {
    return AdditionalCost(
      name: json['name'],
      amount: (json['amount'] as num).toDouble(),
      type: json['type'] ?? 'fixed',
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AdditionalCost && other.name == name;
  }

  @override
  int get hashCode => name.hashCode;

  @override
  String toString() => 'AdditionalCost(name: $name, amount: $amount, type: $type)';
}
