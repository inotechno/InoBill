import '../models/menu_item.dart';
import '../models/additional_cost.dart';
import '../models/discount.dart';
import '../models/split_result.dart';

class SplitCalculator {
  static SplitResult calculateSplit({
    required List<String> participants,
    required List<MenuItem> menuItems,
    required List<AdditionalCost> additionalCosts,
    required Map<String, List<String>> orders,
    required Discount discount,
  }) {
    // Step 1: Calculate subtotal for each menu item
    final Map<String, double> menuSubtotals = {};
    final Map<String, int> menuQuantities = {};
    
    for (final participant in participants) {
      final participantOrders = orders[participant] ?? [];
      for (final itemName in participantOrders) {
        menuQuantities[itemName] = (menuQuantities[itemName] ?? 0) + 1;
      }
    }
    
    for (final item in menuItems) {
      final quantity = menuQuantities[item.name] ?? 0;
      menuSubtotals[item.name] = quantity * item.price;
    }
    
    // Calculate total food cost
    final double totalFoodCost = menuSubtotals.values.fold(0, (sum, subtotal) => sum + subtotal);
    
    // Calculate total additional costs
    double totalAdditionalCosts = 0;
    for (final cost in additionalCosts) {
      if (cost.type == 'fixed') {
        totalAdditionalCosts += cost.amount;
      } else if (cost.type == 'percentage') {
        totalAdditionalCosts += (totalFoodCost * cost.amount / 100);
      }
    }
    
    // Calculate total discount
    double totalDiscount = 0;
    if (discount.hasAmount) {
      totalDiscount = discount.amount;
    } else if (discount.hasPercentage) {
      if (discount.type == 'menu') {
        totalDiscount = totalFoodCost * discount.percentage / 100;
      } else {
        totalDiscount = (totalFoodCost + totalAdditionalCosts) * discount.percentage / 100;
      }
    }
    
    // Step 2: Calculate factor
    final double factor = totalFoodCost > 0 
        ? (totalFoodCost + totalAdditionalCosts - totalDiscount) / totalFoodCost 
        : 1.0;
    
    // Step 3: Calculate adjusted menu prices
    final Map<String, double> adjustedMenuPrices = {};
    for (final item in menuItems) {
      adjustedMenuPrices[item.name] = item.price * factor;
    }
    
    // Step 4: Calculate each participant's cost
    final Map<String, double> participantAmounts = {};
    double grandTotal = 0;
    
    for (final participant in participants) {
      double participantFoodCost = 0;
      final participantOrders = orders[participant] ?? [];
      
      for (final itemName in participantOrders) {
        if (adjustedMenuPrices.containsKey(itemName)) {
          participantFoodCost += adjustedMenuPrices[itemName]!;
        }
      }
      
      participantAmounts[participant] = participantFoodCost;
      grandTotal += participantFoodCost;
    }
    
    return SplitResult(
      participantAmounts: participantAmounts,
      totalFoodCost: totalFoodCost,
      totalAdditionalCosts: totalAdditionalCosts,
      totalDiscount: totalDiscount,
      grandTotal: grandTotal,
      factor: factor,
      adjustedMenuPrices: adjustedMenuPrices,
      discountType: discount.type,
    );
  }
}
