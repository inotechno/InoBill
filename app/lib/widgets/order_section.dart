import 'package:flutter/material.dart';
import '../models/participant.dart';
import '../models/menu_item.dart';

class OrderSection extends StatelessWidget {
  final List<Participant> participants;
  final List<MenuItem> menuItems;
  final Map<String, List<String>> orders;
  final Function(String, List<String>) onUpdateOrder;

  const OrderSection({
    super.key,
    required this.participants,
    required this.menuItems,
    required this.orders,
    required this.onUpdateOrder,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.shopping_cart,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 8),
                Text(
                  'Pesanan',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            if (participants.isEmpty || menuItems.isEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    participants.isEmpty 
                        ? 'Tambahkan peserta terlebih dahulu'
                        : 'Tambahkan menu terlebih dahulu',
                    style: const TextStyle(color: Colors.grey),
                  ),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: participants.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final participant = participants[index];
                  final participantOrders = orders[participant.name] ?? [];
                  
                  return ExpansionTile(
                    leading: CircleAvatar(
                      backgroundColor: Theme.of(context).colorScheme.tertiaryContainer,
                      child: Text(
                        participant.name[0].toUpperCase(),
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.onTertiaryContainer,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    title: Text(
                      participant.name,
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                    subtitle: Text(
                      '${participantOrders.length} item dipesan',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: menuItems.map((menuItem) {
                            final isSelected = participantOrders.contains(menuItem.name);
                            
                            return FilterChip(
                              label: Text(menuItem.name),
                              selected: isSelected,
                              onSelected: (selected) {
                                final newOrders = List<String>.from(participantOrders);
                                if (selected) {
                                  newOrders.add(menuItem.name);
                                } else {
                                  newOrders.remove(menuItem.name);
                                }
                                onUpdateOrder(participant.name, newOrders);
                              },
                              selectedColor: Theme.of(context).colorScheme.primaryContainer,
                              checkmarkColor: Theme.of(context).colorScheme.onPrimaryContainer,
                            );
                          }).toList(),
                        ),
                      ),
                    ],
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
