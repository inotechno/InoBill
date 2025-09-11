# Split Bill Calculator - Flutter

A modern Flutter application for calculating split bills fairly. This app ensures that each participant pays only for what they ordered, while shared costs (like parking, taxes, service charges) are distributed proportionally.

## Features

- **Dynamic Participants**: Add/remove participants easily
- **Menu Management**: Add menu items with prices
- **Additional Costs**: Support for fixed amounts and percentage-based costs
- **Smart Discounts**: Apply discounts to menu only or total bill
- **Fair Calculation**: Uses factor-based calculation for fair distribution
- **Modern UI**: Material Design 3 with responsive layout
- **Real-time Updates**: Instant calculation as you make changes

## Screenshots

The app features a clean, modern interface with:
- Card-based layout for easy organization
- Color-coded sections for different functionalities
- Responsive design that works on all screen sizes
- Clear visual feedback for user interactions

## Getting Started

### Prerequisites

- Flutter SDK (>=3.0.0)
- Dart SDK
- Android Studio / VS Code with Flutter extensions

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd split_bill_calculator
```

2. Install dependencies:
```bash
flutter pub get
```

3. Run the app:
```bash
flutter run
```

## How to Use

1. **Add Participants**: Enter participant names and tap "Tambah"
2. **Add Menu Items**: Enter menu name and price, then tap "Tambah"
3. **Add Additional Costs**: Add costs like parking, service charges, taxes
4. **Set Discounts**: Choose between amount (Rp) or percentage (%) discount
5. **Place Orders**: Select which menu items each participant ordered
6. **Calculate**: Tap "Hitung Split Bill" to see the results

## Calculation Logic

The app uses a sophisticated factor-based calculation:

1. **Calculate Subtotal**: Sum of all menu items ordered
2. **Calculate Factor**: `(Total Subtotal + Additional Costs - Discount) ÷ Total Subtotal`
3. **Adjust Prices**: Each menu item price is multiplied by the factor
4. **Calculate Individual Costs**: Each participant pays for their adjusted menu prices

This ensures:
- Fair distribution of shared costs
- Proportional discount application
- Accurate total matching

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── models/                   # Data models
│   ├── participant.dart
│   ├── menu_item.dart
│   ├── additional_cost.dart
│   ├── discount.dart
│   └── split_result.dart
├── services/                 # Business logic
│   └── split_calculator.dart
├── screens/                  # App screens
│   └── split_bill_screen.dart
└── widgets/                  # Reusable widgets
    ├── participant_section.dart
    ├── menu_section.dart
    ├── additional_cost_section.dart
    ├── order_section.dart
    ├── discount_section.dart
    └── result_section.dart
```

## Dependencies

- `flutter`: Flutter SDK
- `intl`: Internationalization and number formatting
- `cupertino_icons`: iOS-style icons

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have suggestions, please open an issue on GitHub.
