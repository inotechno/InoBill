import 'package:flutter/material.dart';
import '../models/participant.dart';

class ParticipantSection extends StatefulWidget {
  final List<Participant> participants;
  final Function(String) onAddParticipant;
  final Function(String) onRemoveParticipant;

  const ParticipantSection({
    super.key,
    required this.participants,
    required this.onAddParticipant,
    required this.onRemoveParticipant,
  });

  @override
  State<ParticipantSection> createState() => _ParticipantSectionState();
}

class _ParticipantSectionState extends State<ParticipantSection> {
  final TextEditingController _nameController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _addParticipant() {
    final name = _nameController.text.trim();
    if (name.isNotEmpty) {
      widget.onAddParticipant(name);
      _nameController.clear();
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
                    color: Theme.of(context).colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.people,
                    color: Theme.of(context).colorScheme.onPrimaryContainer,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Peserta',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            
            // Add participant input
            isTablet 
              ? Row(
                  children: [
                    Expanded(
                      flex: 3,
                      child: TextField(
                        controller: _nameController,
                        decoration: const InputDecoration(
                          labelText: 'Nama Peserta',
                          hintText: 'Masukkan nama peserta',
                          prefixIcon: Icon(Icons.person_add),
                        ),
                        onSubmitted: (_) => _addParticipant(),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 1,
                      child: ElevatedButton.icon(
                        onPressed: _addParticipant,
                        icon: const Icon(Icons.add),
                        label: const Text('Tambah'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                      ),
                    ),
                  ],
                )
              : Column(
                  children: [
                    TextField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Nama Peserta',
                        hintText: 'Masukkan nama peserta',
                        prefixIcon: Icon(Icons.person_add),
                      ),
                      onSubmitted: (_) => _addParticipant(),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _addParticipant,
                        icon: const Icon(Icons.add),
                        label: const Text('Tambah Peserta'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                      ),
                    ),
                  ],
                ),
            
            const SizedBox(height: 16),
            
            // Participants list
            if (widget.participants.isEmpty)
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
                      Icons.people_outline,
                      size: 48,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Belum ada peserta',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Tambahkan peserta untuk memulai',
                      style: TextStyle(
                        color: Colors.grey.shade500,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              )
            else
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: widget.participants.map((participant) {
                  return Chip(
                    label: Text(
                      participant.name,
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                    deleteIcon: const Icon(Icons.close, size: 18),
                    onDeleted: () => widget.onRemoveParticipant(participant.name),
                    backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                    deleteIconColor: Theme.of(context).colorScheme.onPrimaryContainer,
                    side: BorderSide(
                      color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
                    ),
                  );
                }).toList(),
              ),
          ],
        ),
      ),
    );
  }
}
