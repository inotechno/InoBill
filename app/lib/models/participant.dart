class Participant {
  final String name;
  final List<String> orders;

  Participant({
    required this.name,
    this.orders = const [],
  });

  Participant copyWith({
    String? name,
    List<String>? orders,
  }) {
    return Participant(
      name: name ?? this.name,
      orders: orders ?? this.orders,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'orders': orders,
    };
  }

  factory Participant.fromJson(Map<String, dynamic> json) {
    return Participant(
      name: json['name'],
      orders: List<String>.from(json['orders'] ?? []),
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Participant && other.name == name;
  }

  @override
  int get hashCode => name.hashCode;

  @override
  String toString() => 'Participant(name: $name, orders: $orders)';
}
