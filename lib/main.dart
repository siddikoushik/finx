// ============================================================================
//  FINX - FLUTTER VERSION (UPDATED)
// ============================================================================

import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter/services.dart';
import 'utils/indian_number_formatter.dart';

void main() {
  runApp(const FinxApp());
}

// ===== 2) THEME & STYLING ===================================================

class AppColors {
  static const Color bg = Color(0xFF050506);
  static const Color card = Color(0xFF121216);
  static const Color cardSoft = Color(0xFF181820);
  static const Color accent = Color(0xFFFFC107); // FinX gold
  static const Color accentSoft = Color(0xFFFFD54F);
  static const Color textPrimary = Colors.white;
  static const Color textSecondary = Color(0xFFB0B0B0);
  static const Color danger = Color(0xFFF44336);
  static const Color success = Color(0xFF4CAF50);
  static const Color outline = Color(0xFF333333);
}

final _currencyFormatter = NumberFormat.currency(
  locale: 'en_IN',
  symbol: '₹',
  decimalDigits: 0,
);

String formatCurrency(num amount) => _currencyFormatter.format(amount);

// ===== 3) MODELS & UTILS (CALCULATIONS) =====================================

enum InterestRateMode { perAnnum, perMonth }
enum InterestType { simple, compound }

enum HomeSection { finance, user, units }

// ----- Interest Calculator ---------------------------------------------------

class InterestResult {
  final double maturityAmount;
  final double interestEarned;
  final double effectiveRateAnnual;

  InterestResult({
    required this.maturityAmount,
    required this.interestEarned,
    required this.effectiveRateAnnual,
  });
}

InterestResult calculateInterest({
  required double principal,
  required double periodMonths,
  required double rate,
  required InterestRateMode rateMode,
  required InterestType type,
}) {
  // Normalize everything to monthly
  double monthlyRate =
      rateMode == InterestRateMode.perAnnum ? rate / 12 : rate;

  double maturity;
  if (type == InterestType.simple) {
    // Simple interest: A = P(1 + rt)
    final years = periodMonths / 12.0;
    maturity = principal *
        (1 +
            (rateMode == InterestRateMode.perAnnum
                ? (rate / 100) * years
                : (monthlyRate / 100) * periodMonths));
  } else {
    // Compound monthly: A = P (1 + i)^n
    final i = monthlyRate / 100.0;
    final n = periodMonths;
    maturity = principal * math.pow(1 + i, n);
  }

  final interest = maturity - principal;

  // Effective annual rate from maturity
  final years = periodMonths / 12.0;
  final double effAnnual = years > 0
      ? ((math
                      .pow(maturity / principal, 1 / years)
                  as num)
              .toDouble() -
          1) *
          100
      : 0.0;

  return InterestResult(
    maturityAmount: maturity,
    interestEarned: interest,
    effectiveRateAnnual: effAnnual,
  );
}

// ----- EMI Calculator --------------------------------------------------------

class EMIResult {
  final double monthlyEMI;
  final double totalAmount;
  final double totalInterest;
  final double principalAmount;

  EMIResult({
    required this.monthlyEMI,
    required this.totalAmount,
    required this.totalInterest,
    required this.principalAmount,
  });
}

EMIResult calculateEMI(double principal, double rateAnnual, int tenureMonths) {
  final monthlyRate = rateAnnual / (12 * 100);
  final powVal = math.pow(1 + monthlyRate, tenureMonths);
  final emi = (principal * monthlyRate * powVal) / (powVal - 1);
  final totalAmount = emi * tenureMonths;
  final totalInterest = totalAmount - principal;

  return EMIResult(
    monthlyEMI: emi,
    totalAmount: totalAmount,
    totalInterest: totalInterest,
    principalAmount: principal,
  );
}

// ----- Chit Fund Advanced ----------------------------------------------------

enum ChitType {
  standardEqualDiscount, // discount shared by all N
  auctionNonWinners, // discount shared by N-1 non-winners
  fixed, // no auction, fixed installment
}

class ChitMonthRow {
  final int month;
  final String role;
  final double pay;
  final double receive;
  final double net;
  final double cumulative;

  const ChitMonthRow({
    required this.month,
    required this.role,
    required this.pay,
    required this.receive,
    required this.net,
    required this.cumulative,
  });
}

class ChitFundResult {
  final double monthlyInstallment;
  final double totalPaid;
  final double totalReceived;
  final double netProfit;
  final double commissionAmount;
  final double discountAmount;
  final double dividendPerMember;
  final double dividendPerNonWinner;
  final List<ChitMonthRow> schedule;

  const ChitFundResult({
    required this.monthlyInstallment,
    required this.totalPaid,
    required this.totalReceived,
    required this.netProfit,
    required this.commissionAmount,
    required this.discountAmount,
    required this.dividendPerMember,
    required this.dividendPerNonWinner,
    required this.schedule,
  });
}

ChitFundResult calculateChitFundAdvanced({
  required double chitAmount,
  required int members,
  required double commissionPercent,
  required ChitType type,
  double? discountInput,
  int? payoutMonth,
}) {
  final discount = discountInput ?? 0.0;
  final commissionAmount = chitAmount * (commissionPercent / 100.0);
  final monthlyInstallment = chitAmount / members;

  double dividendPerMember = 0;
  double dividendPerNonWinner = 0;

  if (type == ChitType.standardEqualDiscount && members > 0) {
    dividendPerMember = discount / members;
  } else if (type == ChitType.auctionNonWinners && members > 1) {
    dividendPerNonWinner = discount / (members - 1);
  }

  double prize;
  if (type == ChitType.fixed) {
    prize = chitAmount;
  } else {
    prize = chitAmount - discount - commissionAmount;
  }

  final totalPaid = monthlyInstallment * members;
  double totalReceived;

  if (type == ChitType.fixed) {
    totalReceived = chitAmount;
  } else if (type == ChitType.standardEqualDiscount) {
    totalReceived = prize + dividendPerMember * members;
  } else {
    totalReceived = prize + dividendPerNonWinner * (members - 1);
  }

  final netProfit = totalReceived - totalPaid;

  // Build schedule only if payout month valid
  final List<ChitMonthRow> schedule = [];
  if (payoutMonth != null &&
      payoutMonth >= 1 &&
      payoutMonth <= members) {
    double cumulative = 0;
    for (int m = 1; m <= members; m++) {
      double pay = monthlyInstallment;
      double receive = 0;
      String role;

      if (type == ChitType.fixed) {
        if (m == payoutMonth) {
          role = 'Winner (Payout)';
          receive = chitAmount;
        } else if (m < payoutMonth) {
          role = 'Before Payout';
        } else {
          role = 'After Payout';
        }
      } else if (type == ChitType.standardEqualDiscount) {
        if (m == payoutMonth) {
          role = 'Winner';
          receive = prize + dividendPerMember;
        } else {
          role = 'Non-winner';
          receive = dividendPerMember;
        }
      } else {
        // auctionNonWinners
        if (m == payoutMonth) {
          role = 'Winner';
          receive = prize;
        } else {
          role = 'Non-winner';
          receive = dividendPerNonWinner;
        }
      }

      final net = receive - pay;
      cumulative += net;
      schedule.add(ChitMonthRow(
        month: m,
        role: role,
        pay: pay,
        receive: receive,
        net: net,
        cumulative: cumulative,
      ));
    }
  }

  return ChitFundResult(
    monthlyInstallment: monthlyInstallment,
    totalPaid: totalPaid,
    totalReceived: totalReceived,
    netProfit: netProfit,
    commissionAmount: commissionAmount,
    discountAmount: discount,
    dividendPerMember: dividendPerMember,
    dividendPerNonWinner: dividendPerNonWinner,
    schedule: schedule,
  );
}

// ----- Land Area Converter ---------------------------------------------------

const Map<String, double> _landToSqFeet = {
  'Gunta': 1089,
  'Square Feet': 1,
  'Square Yards': 9,
  'Acres': 43560,
  'Hectares': 107639,
  'Square Meters': 10.7639,
  'Square Kilometers': 10763910,
  'Bigha': 21780, // approx
  'Marla': 272.25,
  'Kanal': 5445,
};

Map<String, double> convertLandArea(double value, String fromUnit) {
  final fromFactor = _landToSqFeet[fromUnit] ?? 1;
  final inSqFeet = value * fromFactor;
  final result = <String, double>{};
  _landToSqFeet.forEach((unit, factor) {
    result[unit] = inSqFeet / factor;
  });
  return result;
}

// ----- Unit Converter --------------------------------------------------------

// Length (add more country units)
const Map<String, double> _lengthToMeters = {
  'Meter': 1,
  'Centimeter': 0.01,
  'Millimeter': 0.001,
  'Kilometer': 1000,
  'Inch': 0.0254,
  'Foot': 0.3048,
  'Yard': 0.9144,
  'Mile': 1609.344,
};

Map<String, double> _convertLinear(
    double value, Map<String, double> toBaseMap, String fromUnit) {
  final factor = toBaseMap[fromUnit] ?? 1;
  final inBase = value * factor;
  final result = <String, double>{};
  toBaseMap.forEach((unit, f) {
    result[unit] = inBase / f;
  });
  return result;
}

// Weight
const Map<String, double> _weightToKg = {
  'Kilogram': 1,
  'Gram': 0.001,
  'Pound (lb)': 0.45359237,
  'Ounce (oz)': 0.0283495231,
  'Tonne': 1000,
};

// Volume
const Map<String, double> _volumeToLiters = {
  'Liter': 1,
  'Milliliter': 0.001,
  'Cubic Meter': 1000,
  'Gallon (US)': 3.78541,
  'Cup (US)': 0.24,
};

// Area
const Map<String, double> _areaToSqMeters = {
  'Square Meter': 1,
  'Square Kilometer': 1e6,
  'Square Foot': 0.092903,
  'Square Yard': 0.836127,
  'Acre': 4046.8564224,
  'Hectare': 10000,
};

// Temperature (special)
Map<String, double> convertTemperature(double value, String fromUnit) {
  double celsius;
  if (fromUnit == 'Celsius') {
    celsius = value;
  } else if (fromUnit == 'Fahrenheit') {
    celsius = (value - 32) * 5 / 9;
  } else {
    // Kelvin
    celsius = value - 273.15;
  }

  final result = <String, double>{};
  result['Celsius'] = celsius;
  result['Fahrenheit'] = celsius * 9 / 5 + 32;
  result['Kelvin'] = celsius + 273.15;
  return result;
}

// ----- Daily Expenses model --------------------------------------------------

class ExpenseItem {
  final String description;
  final String category;
  final double amount;
  final DateTime date;

  ExpenseItem({
    required this.description,
    required this.category,
    required this.amount,
    required this.date,
  });
}

// ===== 4) HOME SCREEN & NAVIGATION ==========================================

class FinxApp extends StatefulWidget {
  const FinxApp({super.key});

  @override
  State<FinxApp> createState() => _FinxAppState();
}

class _FinxAppState extends State<FinxApp> {
  bool darkTheme = true;

  @override
  Widget build(BuildContext context) {
    final baseTheme = ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.bg,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.accent,
        secondary: AppColors.accentSoft,
        surface: AppColors.card,
      ),
      useMaterial3: true,
      fontFamily: 'SF Pro Display',
    );

    return MaterialApp(
      title: 'FinX',
      debugShowCheckedModeBanner: false,
      theme: baseTheme,
      home: HomeScreen(
        onToggleTheme: () {},
      ),
    );
  }
}

// ---- New tabbed HomeScreen --------------------------------------------------

class HomeScreen extends StatefulWidget {
  final VoidCallback onToggleTheme;
  const HomeScreen({super.key, required this.onToggleTheme});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  HomeSection section = HomeSection.finance;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _HomeHeader(onToggleTheme: widget.onToggleTheme),
              const SizedBox(height: 16),
              const Text(
                'Welcome to FinX',
                style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary),
              ),
              const SizedBox(height: 4),
              const Text(
                'Simplify Every Rupee',
                style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 16),
              _SectionTabs(
                selected: section,
                onChanged: (s) => setState(() => section = s),
              ),
              const SizedBox(height: 12),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 250),
                transitionBuilder: (child, anim) => FadeTransition(
                  opacity: anim,
                  child: SlideTransition(
                    position: Tween<Offset>(
                      begin: const Offset(0, 0.05),
                      end: Offset.zero,
                    ).animate(anim),
                    child: child,
                  ),
                ),
                child: _buildSection(section),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSection(HomeSection s) {
    switch (s) {
      case HomeSection.finance:
        return Column(
          key: const ValueKey('finance'),
          children: [
            const SectionTitle('Finance Calculators'),
            const SizedBox(height: 8),
            _HomeCard(
              title: 'Interest Calculator',
              subtitle: 'Simple & Compound Interest',
              icon: Icons.calculate_outlined,
              buttonColor: Colors.grey,
              onTap: () => _nav(context, const InterestCalculatorScreen()),
            ),
            _HomeCard(
              title: 'Chit Fund',
              subtitle: 'Chit types + cash-flow table',
              icon: Icons.groups_2,
              buttonColor: Colors.green,
              onTap: () => _nav(context, const ChitFundCalculatorScreen()),
            ),
            _HomeCard(
              title: 'EMI',
              subtitle: 'Calculate EMI and loan details',
              icon: Icons.payments_rounded,
              buttonColor: Colors.redAccent,
              onTap: () => _nav(context, const EMICalculatorScreen()),
            ),
            _HomeCard(
              title: 'Fixed Deposit (FD)',
              subtitle: 'Fixed deposit calculator',
              icon: Icons.lock_outline,
              buttonColor: Colors.deepPurple,
              onTap: () => _nav(
                context,
                const InterestCalculatorScreen(preselectSimple: true),
              ),
            ),
          ],
        );
      case HomeSection.user:
        return Column(
          key: const ValueKey('user'),
          children: [
            const SectionTitle('User Tools'),
            const SizedBox(height: 8),
            _HomeCard(
              title: 'Daily Expenses',
              subtitle: 'Track your daily spending',
              icon: Icons.receipt_long,
              buttonColor: Colors.orange,
              onTap: () => _nav(context, const DailyExpensesScreen()),
            ),
          ],
        );
      case HomeSection.units:
        return Column(
          key: const ValueKey('units'),
          children: [
            const SectionTitle('Unit & Area Calculators'),
            const SizedBox(height: 8),
            _HomeCard(
              title: 'Land Area Converter',
              subtitle: 'Convert gunta, acres, sqft',
              icon: Icons.terrain,
              buttonColor: Colors.green,
              onTap: () => _nav(context, const LandAreaConverterScreen()),
            ),
            _HomeCard(
              title: 'Unit Converter',
              subtitle: 'Length, weight, temp, more',
              icon: Icons.swap_horiz,
              buttonColor: Colors.blue,
              onTap: () => _nav(context, const UnitConverterScreen()),
            ),
          ],
        );
    }
  }

  void _nav(BuildContext context, Widget screen) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
  }
}

class _SectionTabs extends StatelessWidget {
  final HomeSection selected;
  final ValueChanged<HomeSection> onChanged;
  const _SectionTabs(
      {required this.selected, required this.onChanged, super.key});

  Widget _tab(String text, HomeSection s) => Expanded(
        child: GestureDetector(
          onTap: () => onChanged(s),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 10),
            decoration: BoxDecoration(
              color: selected == s ? AppColors.accent : AppColors.cardSoft,
              borderRadius: BorderRadius.circular(30),
            ),
            child: Text(
              text,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: selected == s ? Colors.black : AppColors.textSecondary,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
          ),
        ),
      );

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _tab('Finance', HomeSection.finance),
        const SizedBox(width: 6),
        _tab('User', HomeSection.user),
        const SizedBox(width: 6),
        _tab('Units & Area', HomeSection.units),
      ],
    );
  }
}

class _HomeHeader extends StatelessWidget {
  final VoidCallback onToggleTheme;

  const _HomeHeader({required this.onToggleTheme});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.outline),
        boxShadow: [
          BoxShadow(
            color: AppColors.accent.withOpacity(0.22),
            blurRadius: 24,
            spreadRadius: 1,
            offset: const Offset(0, 9),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            decoration: BoxDecoration(
              color: AppColors.accent.withOpacity(0.18),
              shape: BoxShape.circle,
            ),
            padding: const EdgeInsets.all(10),
            child: const Icon(Icons.attach_money,
                color: AppColors.accent, size: 22),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Text(
              'FinX',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.person, color: AppColors.accent),
            color: AppColors.cardSoft,
            onSelected: (value) {
              if (value == 'history') {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('History (not yet linked)')),
                );
              } else if (value == 'theme') {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Dark theme already enabled')),
                );
              } else if (value == 'logout') {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Logout not configured')),
                );
              }
            },
            itemBuilder: (ctx) => const [
              PopupMenuItem(
                value: 'history',
                child: ListTile(
                  leading: Icon(Icons.history),
                  title: Text('History'),
                ),
              ),
              PopupMenuItem(
                value: 'theme',
                child: ListTile(
                  leading: Icon(Icons.dark_mode),
                  title: Text('Dark Theme'),
                ),
              ),
              PopupMenuItem(
                value: 'logout',
                child: ListTile(
                  leading: Icon(Icons.logout),
                  title: Text('Logout'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HomeCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color buttonColor;
  final VoidCallback onTap;

  const _HomeCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.buttonColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.outline),
        boxShadow: [
          BoxShadow(
            color: buttonColor.withOpacity(0.3),
            blurRadius: 20,
            spreadRadius: 1,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.textSecondary),
          const SizedBox(height: 10),
          Text(
            title,
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: buttonColor,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 10),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              onPressed: onTap,
              child: const Text(
                'Open',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 15,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ===== 5) INTEREST CALCULATOR (FD) ==========================================

class InterestCalculatorScreen extends StatefulWidget {
  final bool preselectSimple;

  const InterestCalculatorScreen({super.key, this.preselectSimple = true});

  @override
  State<InterestCalculatorScreen> createState() =>
      _InterestCalculatorScreenState();
}

class _InterestCalculatorScreenState extends State<InterestCalculatorScreen> {
  final principalCtrl = TextEditingController();
  final periodCtrl = TextEditingController();
  final rateCtrl = TextEditingController();

  InterestRateMode rateMode = InterestRateMode.perAnnum;
  late InterestType type;
  bool _periodIsYears = false; // months/years toggle

  InterestResult? _result;

  @override
  void initState() {
    super.initState();
    type = widget.preselectSimple ? InterestType.simple : InterestType.compound;
  }

  void _calculate() {
    final p = double.tryParse(principalCtrl.text.replaceAll(',', '')) ?? 0;
    final rawPeriod = double.tryParse(periodCtrl.text) ?? 0;
    final r = double.tryParse(rateCtrl.text) ?? 0;

    if (p <= 0 || rawPeriod <= 0 || r <= 0) {
      _showError('All values must be greater than 0');
      return;
    }

    final periodMonths = _periodIsYears ? rawPeriod * 12.0 : rawPeriod;

    setState(() {
      _result = calculateInterest(
        principal: p,
        periodMonths: periodMonths,
        rate: r,
        rateMode: rateMode,
        type: type,
      );
    });
  }

  void _showError(String msg) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Error'),
        content: Text(msg),
        actions: [
          TextButton(
            child: const Text('OK'),
            onPressed: () => Navigator.pop(context),
          )
        ],
      ),
    );
  }

  @override
  void dispose() {
    principalCtrl.dispose();
    periodCtrl.dispose();
    rateCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CalculatorScaffold(
      title: 'Interest Calculator',
      onBack: () => Navigator.pop(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionTitle('Investment Details'),
          const SizedBox(height: 10),
          LabeledField(
            label: 'Principal Amount (₹)',
            controller: principalCtrl,
            prefix:
                const Text('₹ ', style: TextStyle(color: AppColors.accentSoft)),
            indianNumberFormat: true,
          ),
          const SizedBox(height: 10),
          LabeledField(
            label: 'Investment Period',
            controller: periodCtrl,
            suffix: SmallUnitToggle(
              firstLabel: 'Months',
              secondLabel: 'Years',
              isSecond: _periodIsYears,
              onChanged: (isYears) =>
                  setState(() => _periodIsYears = isYears),
            ),
          ),
          const SizedBox(height: 10),
          LabeledField(
            label: 'Interest Rate',
            controller: rateCtrl,
            suffix: const Text('%', style: TextStyle(color: AppColors.accent)),
          ),
          const SizedBox(height: 12),
          ToggleRow(
            firstLabel: 'Per Annum',
            secondLabel: 'Per Month',
            selectedFirst: rateMode == InterestRateMode.perAnnum,
            onChanged: (first) {
              setState(() {
                rateMode =
                    first ? InterestRateMode.perAnnum : InterestRateMode.perMonth;
              });
            },
          ),
          const SizedBox(height: 8),
          ToggleRow(
            firstLabel: 'Simple Interest',
            secondLabel: 'Compound Interest',
            selectedFirst: type == InterestType.simple,
            onChanged: (first) {
              setState(() {
                type = first ? InterestType.simple : InterestType.compound;
              });
            },
          ),
          const SizedBox(height: 16),
          PrimaryButton(
            label: 'Calculate',
            onPressed: _calculate,
          ),
          const SizedBox(height: 18),
          if (_result != null) ...[
            const SectionTitle('Results'),
            const SizedBox(height: 10),
            ResultCard(
              rows: [
                ResultRow(
                  label: 'Maturity Amount:',
                  value: formatCurrency(_result!.maturityAmount),
                  valueColor: AppColors.accent,
                ),
                ResultRow(
                  label: 'Interest Earned:',
                  value: formatCurrency(_result!.interestEarned),
                  valueColor: AppColors.success,
                ),
                ResultRow(
                  label: 'Effective Rate:',
                  value:
                      '${_result!.effectiveRateAnnual.toStringAsFixed(2)}% p.a.',
                ),
              ],
            ),
            const SizedBox(height: 12),
            SecondaryButton(
              label: 'Save to History (UI only)',
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('History not linked yet')),
                );
              },
            ),
          ],
        ],
      ),
    );
  }
}

// ===== 6) EMI CALCULATOR SCREEN =============================================

class EMICalculatorScreen extends StatefulWidget {
  const EMICalculatorScreen({super.key});

  @override
  State<EMICalculatorScreen> createState() => _EMICalculatorScreenState();
}

class _EMICalculatorScreenState extends State<EMICalculatorScreen> {
  final amountCtrl = TextEditingController();
  final periodCtrl = TextEditingController();
  final rateCtrl = TextEditingController();

  bool ratePerAnnum = true;
  bool _tenureIsYears = false; // months/years toggle
  EMIResult? _result;

  void _calculate() {
    final amount = double.tryParse(amountCtrl.text.replaceAll(',', '')) ?? 0;
    final rawPeriod = double.tryParse(periodCtrl.text) ?? 0;
    final rate = double.tryParse(rateCtrl.text) ?? 0;

    if (amount <= 0 || rawPeriod <= 0 || rate <= 0) {
      _showError('All values must be greater than 0');
      return;
    }

    final months = _tenureIsYears ? (rawPeriod * 12).round() : rawPeriod.round();
    final annualRate = ratePerAnnum ? rate : rate * 12;

    setState(() {
      _result = calculateEMI(amount, annualRate, months);
    });
  }

  void _showError(String msg) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Error'),
        content: Text(msg),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('OK')),
        ],
      ),
    );
  }

  @override
  void dispose() {
    amountCtrl.dispose();
    periodCtrl.dispose();
    rateCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CalculatorScaffold(
      title: 'Loan EMI Calculator',
      onBack: () => Navigator.pop(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionTitle('Loan Details'),
          const SizedBox(height: 10),
          LabeledField(
            label: 'Loan Amount (₹)',
            controller: amountCtrl,
            prefix:
                const Text('₹ ', style: TextStyle(color: AppColors.accentSoft)),
            indianNumberFormat: true,
          ),
          const SizedBox(height: 10),
          LabeledField(
            label: 'Loan Period',
            controller: periodCtrl,
            suffix: SmallUnitToggle(
              firstLabel: 'Months',
              secondLabel: 'Years',
              isSecond: _tenureIsYears,
              onChanged: (isYears) =>
                  setState(() => _tenureIsYears = isYears),
            ),
          ),
          const SizedBox(height: 10),
          LabeledField(
            label: 'Interest Rate',
            controller: rateCtrl,
            suffix: const Text('%', style: TextStyle(color: AppColors.accent)),
          ),
          const SizedBox(height: 12),
          ToggleRow(
            firstLabel: 'Per Annum',
            secondLabel: 'Per Month',
            selectedFirst: ratePerAnnum,
            onChanged: (first) {
              setState(() {
                ratePerAnnum = first;
              });
            },
          ),
          const SizedBox(height: 16),
          PrimaryButton(label: 'Calculate EMI', onPressed: _calculate),
          const SizedBox(height: 18),
          if (_result != null) ...[
            const SectionTitle('EMI Results'),
            const SizedBox(height: 10),
            ResultCard(
              rows: [
                ResultRow(
                  label: 'Monthly EMI:',
                  value: formatCurrency(_result!.monthlyEMI),
                  valueColor: AppColors.accent,
                ),
                ResultRow(
                  label: 'Total Interest:',
                  value: formatCurrency(_result!.totalInterest),
                  valueColor: AppColors.danger,
                ),
                ResultRow(
                  label: 'Total Payment:',
                  value: formatCurrency(_result!.totalAmount),
                ),
                ResultRow(
                  label: 'Monthly Interest Rate:',
                  value:
                      '${(ratePerAnnum ? (double.parse(rateCtrl.text) / 12) : double.parse(rateCtrl.text)).toStringAsFixed(3)}%',
                  showDivider: false,
                ),
              ],
            ),
            const SizedBox(height: 12),
            SecondaryButton(
              label: 'Hide Breakdown (UI only)',
              onPressed: () {},
            ),
            const SizedBox(height: 8),
            PrimaryButton(
              label: 'Save to History (UI only)',
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('History not linked yet')),
                );
              },
            ),
          ],
        ],
      ),
    );
  }
}

// ===== 7) CHIT FUND CALCULATOR (3 TYPES + TABLE) ============================

class ChitFundCalculatorScreen extends StatefulWidget {
  const ChitFundCalculatorScreen({super.key});

  @override
  State<ChitFundCalculatorScreen> createState() =>
      _ChitFundCalculatorScreenState();
}

class _ChitFundCalculatorScreenState extends State<ChitFundCalculatorScreen> {
  final totalCtrl = TextEditingController();
  final membersCtrl = TextEditingController();
  final commissionCtrl = TextEditingController();
  final discountCtrl = TextEditingController();
  final payoutMonthCtrl = TextEditingController();

  ChitType _type = ChitType.standardEqualDiscount;
  ChitFundResult? _result;

  void _calculate() {
    final total = double.tryParse(totalCtrl.text.replaceAll(',', '')) ?? 0;
    final members = int.tryParse(membersCtrl.text) ?? 0;
    final commission = double.tryParse(commissionCtrl.text) ?? 0;
    final discount =
        discountCtrl.text.trim().isEmpty ? null : double.tryParse(discountCtrl.text);
    final payoutRaw = int.tryParse(payoutMonthCtrl.text);

    if (total <= 0 || members <= 0 || commission < 0) {
      _showError('Please enter valid chit amount, members and commission');
      return;
    }

    int? payoutMonth;
    if (payoutRaw != null && payoutRaw >= 1 && payoutRaw <= members) {
      payoutMonth = payoutRaw;
    }

    setState(() {
      _result = calculateChitFundAdvanced(
        chitAmount: total,
        members: members,
        commissionPercent: commission,
        type: _type,
        discountInput: discount,
        payoutMonth: payoutMonth,
      );
    });
  }

  void _showError(String msg) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Error'),
        content: Text(msg),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('OK')),
        ],
      ),
    );
  }

  @override
  void dispose() {
    totalCtrl.dispose();
    membersCtrl.dispose();
    commissionCtrl.dispose();
    discountCtrl.dispose();
    payoutMonthCtrl.dispose();
    super.dispose();
  }

  String _typeLabel(ChitType t) {
    switch (t) {
      case ChitType.standardEqualDiscount:
        return 'Standard Auction\n(Equal Share)';
      case ChitType.auctionNonWinners:
        return 'Auction\n(Non-winners Share)';
      case ChitType.fixed:
        return 'Fixed Chit\n(No Auction)';
    }
  }

  @override
  Widget build(BuildContext context) {
    return CalculatorScaffold(
      title: 'Chit Fund Calculator',
      onBack: () => Navigator.pop(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionTitle('Chit Fund Details'),
          const SizedBox(height: 10),
          LabeledField(
            label: 'Total Chit Amount (₹)',
            controller: totalCtrl,
            prefix:
                const Text('₹ ', style: TextStyle(color: AppColors.accentSoft)),
            indianNumberFormat: true,
          ),
          const SizedBox(height: 10),
          LabeledField(
            label: 'Number of Members / Months (N)',
            controller: membersCtrl,
          ),
          const SizedBox(height: 10),
          LabeledField(
            label: 'Commission % (Foreman)',
            controller: commissionCtrl,
            suffix: const Text('%', style: TextStyle(color: AppColors.accent)),
          ),
          const SizedBox(height: 12),
          const Text(
            'Chit Type',
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: ChitType.values.map((t) {
              final selected = t == _type;
              return GestureDetector(
                onTap: () => setState(() => _type = t),
                child: Container(
                  width: 120,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color:
                        selected ? AppColors.accent : Colors.transparent,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: selected
                          ? Colors.transparent
                          : AppColors.textSecondary,
                    ),
                  ),
                  child: Text(
                    _typeLabel(t),
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 11,
                      color:
                          selected ? Colors.black : AppColors.textSecondary,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 10),
          if (_type != ChitType.fixed)
            LabeledField(
              label: 'Auction Discount D (optional)',
              controller: discountCtrl,
            ),
          if (_type != ChitType.fixed) const SizedBox(height: 10),
          LabeledField(
            label: 'Your Payout Month X (optional)',
            controller: payoutMonthCtrl,
          ),
          const SizedBox(height: 16),
          PrimaryButton(label: 'Calculate', onPressed: _calculate),
          const SizedBox(height: 18),
          if (_result != null) ...[
            const SectionTitle('Summary'),
            const SizedBox(height: 10),
            ResultCard(
              rows: [
                ResultRow(
                  label: 'Monthly Contribution:',
                  value: formatCurrency(_result!.monthlyInstallment),
                ),
                ResultRow(
                  label: 'Total Paid (N months):',
                  value: formatCurrency(_result!.totalPaid),
                ),
                ResultRow(
                  label: 'Total Amount Received:',
                  value: formatCurrency(_result!.totalReceived),
                  valueColor: AppColors.accent,
                ),
                ResultRow(
                  label: 'Net Profit / Loss:',
                  value: formatCurrency(_result!.netProfit),
                  valueColor: _result!.netProfit >= 0
                      ? AppColors.success
                      : AppColors.danger,
                  showDivider: false,
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (_type != ChitType.fixed)
              ResultCard(
                rows: [
                  ResultRow(
                    label: 'Commission Amount:',
                    value: formatCurrency(_result!.commissionAmount),
                  ),
                  ResultRow(
                    label: 'Auction Discount D:',
                    value: formatCurrency(_result!.discountAmount),
                  ),
                  if (_type == ChitType.standardEqualDiscount)
                    ResultRow(
                      label: 'Dividend per Member:',
                      value: formatCurrency(_result!.dividendPerMember),
                      showDivider: false,
                    ),
                  if (_type == ChitType.auctionNonWinners)
                    ResultRow(
                      label: 'Dividend per Non-winner:',
                      value: formatCurrency(_result!.dividendPerNonWinner),
                      showDivider: false,
                    ),
                ],
              ),
            if (_result!.schedule.isNotEmpty) ...[
              const SizedBox(height: 16),
              const SectionTitle('Month-by-Month Cash Flow (Type A)'),
              const SizedBox(height: 8),
              const Text(
                'Shows how your cash flow changes each month based on when you take the chit.',
                style:
                    TextStyle(color: AppColors.textSecondary, fontSize: 12),
              ),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: AppColors.cardSoft,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.outline),
                ),
                child: Column(
                  children: [
                    // header
                    Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 6),
                      child: Row(
                        children: const [
                          Expanded(
                            flex: 1,
                            child: Text('M',
                                style: TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600)),
                          ),
                          Expanded(
                            flex: 3,
                            child: Text('Role',
                                style: TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600)),
                          ),
                          Expanded(
                            flex: 3,
                            child: Text('Pay',
                                textAlign: TextAlign.right,
                                style: TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600)),
                          ),
                          Expanded(
                            flex: 3,
                            child: Text('Receive',
                                textAlign: TextAlign.right,
                                style: TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600)),
                          ),
                          Expanded(
                            flex: 3,
                            child: Text('Net',
                                textAlign: TextAlign.right,
                                style: TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600)),
                          ),
                          Expanded(
                            flex: 3,
                            child: Text('Cumulative',
                                textAlign: TextAlign.right,
                                style: TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600)),
                          ),
                        ],
                      ),
                    ),
                    const Divider(color: AppColors.outline, height: 1),
                    Column(
                      children: _result!.schedule.map((row) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          child: Row(
                            children: [
                              Expanded(
                                flex: 1,
                                child: Text(
                                  row.month.toString(),
                                  style: const TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 11),
                                ),
                              ),
                              Expanded(
                                flex: 3,
                                child: Text(
                                  row.role,
                                  style: const TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 11),
                                ),
                              ),
                              Expanded(
                                flex: 3,
                                child: Text(
                                  formatCurrency(row.pay),
                                  textAlign: TextAlign.right,
                                  style: const TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 11),
                                ),
                              ),
                              Expanded(
                                flex: 3,
                                child: Text(
                                  formatCurrency(row.receive),
                                  textAlign: TextAlign.right,
                                  style: const TextStyle(
                                      color: AppColors.accent,
                                      fontSize: 11),
                                ),
                              ),
                              Expanded(
                                flex: 3,
                                child: Text(
                                  formatCurrency(row.net),
                                  textAlign: TextAlign.right,
                                  style: TextStyle(
                                    color: row.net >= 0
                                        ? AppColors.success
                                        : AppColors.danger,
                                    fontSize: 11,
                                  ),
                                ),
                              ),
                              Expanded(
                                flex: 3,
                                child: Text(
                                  formatCurrency(row.cumulative),
                                  textAlign: TextAlign.right,
                                  style: TextStyle(
                                    color: row.cumulative >= 0
                                        ? AppColors.success
                                        : AppColors.danger,
                                    fontSize: 11,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }
}

// ===== 8) DAILY EXPENSES SCREEN =============================================

class DailyExpensesScreen extends StatefulWidget {
  const DailyExpensesScreen({super.key});

  @override
  State<DailyExpensesScreen> createState() => _DailyExpensesScreenState();
}

class _DailyExpensesScreenState extends State<DailyExpensesScreen> {
  final amountCtrl = TextEditingController();
  final descCtrl = TextEditingController();
  String category = 'Food & Dining';

  final List<ExpenseItem> _items = [];

  double get todayTotal {
    final today = DateTime.now();
    return _items
        .where((e) =>
            e.date.year == today.year &&
            e.date.month == today.month &&
            e.date.day == today.day)
        .fold(0, (sum, e) => sum + e.amount);
  }

  double get total =>
      _items.fold(0, (previousValue, element) => previousValue + element.amount);

  void _addExpense() {
    final amount = double.tryParse(amountCtrl.text.replaceAll(',', '')) ?? 0;
    var desc = descCtrl.text.trim();

    if (amount <= 0) {
      _showError('Enter a valid amount');
      return;
    }

    // If user didn't give any description, use category as description
    if (desc.isEmpty) {
      desc = category;
    }

    setState(() {
      _items.add(ExpenseItem(
        description: desc,
        category: category,
        amount: amount,
        date: DateTime.now(), // includes time
      ));
      amountCtrl.clear();
      descCtrl.clear();
    });
  }

  void _deleteExpense(int index) {
    setState(() {
      _items.removeAt(index);
    });
  }

  void _showError(String msg) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Error'),
        content: Text(msg),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('OK')),
        ],
      ),
    );
  }

  @override
  void dispose() {
    amountCtrl.dispose();
    descCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CalculatorScaffold(
      title: 'Daily Expenses',
      onBack: () => Navigator.pop(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: StatCard(
                  label: "Today's Expenses",
                  value: formatCurrency(todayTotal),
                  icon: Icons.today,
                  highlight: true,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: StatCard(
                  label: "Total Expenses",
                  value: formatCurrency(total),
                  icon: Icons.account_balance_wallet_outlined,
                  highlight: false,
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          const SectionTitle('Add New Expense'),
          const SizedBox(height: 10),
          LabeledField(
            label: 'Amount (₹)',
            controller: amountCtrl,
            keyboard: TextInputType.number,
            indianNumberFormat: true,
          ),
          const SizedBox(height: 10),
          const Text(
            'Category',
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 8,
            children: [
              CategoryChip(
                label: 'Food & Dining',
                icon: Icons.restaurant,
                selected: category == 'Food & Dining',
                onTap: () => setState(() => category = 'Food & Dining'),
              ),
              CategoryChip(
                label: 'Transportation',
                icon: Icons.directions_bus,
                selected: category == 'Transportation',
                onTap: () => setState(() => category = 'Transportation'),
              ),
              CategoryChip(
                label: 'Shopping',
                icon: Icons.shopping_bag,
                selected: category == 'Shopping',
                onTap: () => setState(() => category = 'Shopping'),
              ),
            ],
          ),
          const SizedBox(height: 10),
          LabeledField(
            label: 'Description',
            controller: descCtrl,
            maxLines: 3,
          ),
          const SizedBox(height: 14),
          PrimaryButton(label: 'Add Expense', onPressed: _addExpense),
          const SizedBox(height: 18),
          const SectionTitle('Recent Expenses'),
          const SizedBox(height: 8),
          if (_items.isEmpty)
            const Text(
              'No expenses added yet',
              style: TextStyle(color: AppColors.textSecondary),
            )
          else
            Column(
              children: List.generate(_items.length, (i) {
                final e = _items[_items.length - 1 - i]; // latest first
                final dateStr =
                    DateFormat('dd-MMM-yyyy, hh:mm a').format(e.date);
                return ExpenseTile(
                  item: e,
                  dateLabel: dateStr,
                  onDelete: () => _deleteExpense(_items.length - 1 - i),
                );
              }),
            ),
        ],
      ),
    );
  }
}

// ===== 9) LAND AREA CONVERTER SCREEN ========================================

class LandAreaConverterScreen extends StatefulWidget {
  const LandAreaConverterScreen({super.key});

  @override
  State<LandAreaConverterScreen> createState() =>
      _LandAreaConverterScreenState();
}

class _LandAreaConverterScreenState extends State<LandAreaConverterScreen> {
  final valueCtrl = TextEditingController(); // start empty
  String fromUnit = 'Acres';
  Map<String, double>? result;

  void _convert() {
    final val = double.tryParse(valueCtrl.text) ?? 0;
    if (val <= 0) {
      _showError('Value must be greater than 0');
      return;
    }
    setState(() {
      result = convertLandArea(val, fromUnit);
    });
  }

  void _showError(String msg) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Error'),
        content: Text(msg),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('OK')),
        ],
      ),
    );
  }

  @override
  void dispose() {
    valueCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CalculatorScaffold(
      title: 'Land Area Converter',
      onBack: () => Navigator.pop(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionTitle('Land Area Converter'),
          const SizedBox(height: 8),
          const Text(
            'Convert between different land measurement units',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
          ),
          const SizedBox(height: 12),
          LabeledField(
            label: 'Enter Value',
            controller: valueCtrl,
            keyboard: TextInputType.number,
          ),
          const SizedBox(height: 10),
          const Text(
            'From Unit',
            style: TextStyle(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _landToSqFeet.keys.map((unit) {
              final selected = unit == fromUnit;
              return ChoiceChip(
                label: Text(unit),
                selected: selected,
                selectedColor: AppColors.accent,
                backgroundColor: AppColors.cardSoft,
                labelStyle: TextStyle(
                  color: selected ? Colors.black : AppColors.textPrimary,
                ),
                onSelected: (_) {
                  setState(() => fromUnit = unit);
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 14),
          PrimaryButton(label: 'Convert', onPressed: _convert),
          const SizedBox(height: 18),
          if (result != null) ...[
            SectionTitle('${valueCtrl.text} $fromUnit equals:'),
            const SizedBox(height: 10),
            LandResultGrid(result: result!),
            const SizedBox(height: 18),
            const SectionTitle('Common Conversions'),
            const SizedBox(height: 8),
            const LandReferenceCard(),
          ],
        ],
      ),
    );
  }
}

// ===== 10) UNIT CONVERTER SCREEN ============================================

class UnitConverterScreen extends StatefulWidget {
  const UnitConverterScreen({super.key});

  @override
  State<UnitConverterScreen> createState() => _UnitConverterScreenState();
}

class _UnitConverterScreenState extends State<UnitConverterScreen> {
  String category = 'Length';
  String fromUnit = 'Meter';
  final valueCtrl = TextEditingController();

  Map<String, double>? result;

  List<String> get _currentUnits {
    switch (category) {
      case 'Length':
        return _lengthToMeters.keys.toList();
      case 'Weight':
        return _weightToKg.keys.toList();
      case 'Volume':
        return _volumeToLiters.keys.toList();
      case 'Area':
        return _areaToSqMeters.keys.toList();
      case 'Temperature':
        return ['Celsius', 'Fahrenheit', 'Kelvin'];
      default:
        return _lengthToMeters.keys.toList();
    }
  }

  String get _categoryTitle => '$category Converter';

  void _convert() {
    final val = double.tryParse(valueCtrl.text) ?? 0;
    if (val <= 0) {
      _showError('Value must be greater than 0');
      return;
    }

    Map<String, double> res;
    switch (category) {
      case 'Length':
        res = _convertLinear(val, _lengthToMeters, fromUnit);
        break;
      case 'Weight':
        res = _convertLinear(val, _weightToKg, fromUnit);
        break;
      case 'Volume':
        res = _convertLinear(val, _volumeToLiters, fromUnit);
        break;
      case 'Area':
        res = _convertLinear(val, _areaToSqMeters, fromUnit);
        break;
      case 'Temperature':
        res = convertTemperature(val, fromUnit);
        break;
      default:
        res = _convertLinear(val, _lengthToMeters, fromUnit);
    }

    setState(() {
      result = res;
    });
  }

  void _showError(String msg) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Info'),
        content: Text(msg),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('OK')),
        ],
      ),
    );
  }

  @override
  void dispose() {
    valueCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final units = _currentUnits;
    if (!units.contains(fromUnit)) {
      fromUnit = units.first;
    }

    return CalculatorScaffold(
      title: 'Unit Converter',
      onBack: () => Navigator.pop(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionTitle('Select Category'),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            children: [
              CategoryChip(
                label: 'Length',
                icon: Icons.straighten,
                selected: category == 'Length',
                onTap: () => setState(() => category = 'Length'),
              ),
              CategoryChip(
                label: 'Weight',
                icon: Icons.fitness_center,
                selected: category == 'Weight',
                onTap: () => setState(() => category = 'Weight'),
              ),
              CategoryChip(
                label: 'Temperature',
                icon: Icons.device_thermostat,
                selected: category == 'Temperature',
                onTap: () => setState(() => category = 'Temperature'),
              ),
              CategoryChip(
                label: 'Volume',
                icon: Icons.local_drink,
                selected: category == 'Volume',
                onTap: () => setState(() => category = 'Volume'),
              ),
              CategoryChip(
                label: 'Area',
                icon: Icons.crop_square,
                selected: category == 'Area',
                onTap: () => setState(() => category = 'Area'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SectionTitle(_categoryTitle),
          const SizedBox(height: 8),
          LabeledField(
            label: 'Enter Value',
            controller: valueCtrl,
            keyboard: TextInputType.number,
          ),
          const SizedBox(height: 10),
          const Text(
            'From Unit',
            style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 14,
                fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 8,
            children: units.map((unit) {
              final selected = unit == fromUnit;
              return ChoiceChip(
                label: Text(unit),
                selected: selected,
                selectedColor: AppColors.accent,
                backgroundColor: AppColors.cardSoft,
                labelStyle: TextStyle(
                  color: selected ? Colors.black : AppColors.textPrimary,
                ),
                onSelected: (_) => setState(() => fromUnit = unit),
              );
            }).toList(),
          ),
          const SizedBox(height: 14),
          PrimaryButton(label: 'Convert', onPressed: _convert),
          const SizedBox(height: 18),
          if (result != null)
            ResultCard(
              rows: result!.entries
                  .map(
                    (e) => ResultRow(
                      label: e.key,
                      value: e.value.toStringAsFixed(2),
                    ),
                  )
                  .toList(),
            ),
          const SizedBox(height: 18),
          const SectionTitle('Quick Reference'),
          const SizedBox(height: 8),
          const Text(
            'Length: 1 meter = 100 cm = 1000 mm\n'
            'Weight: 1 kg = 1000 g ≈ 2.2 lb\n'
            'Temperature: 0°C = 32°F = 273K\n'
            'Volume: 1 liter = 1000 ml ≈ 0.26 gallons\n'
            'Area: 1 sqm ≈ 10.76 sqft ≈ 1.2 sqyd',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
          ),
        ],
      ),
    );
  }
}

// ===== 11) SHARED WIDGETS ====================================================

class CalculatorScaffold extends StatelessWidget {
  final String title;
  final VoidCallback onBack;
  final Widget child;

  const CalculatorScaffold({
    super.key,
    required this.title,
    required this.onBack,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.accent.withOpacity(0.25),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    GestureDetector(
                      onTap: onBack,
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppColors.accent.withOpacity(0.15),
                          shape: BoxShape.circle,
                        ),
                        padding: const EdgeInsets.all(8),
                        child: const Icon(
                          Icons.arrow_back,
                          color: AppColors.accent,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        title,
                        style: const TextStyle(
                          color: AppColors.accent,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Container(
                      decoration: const BoxDecoration(
                        color: Color(0xFF26262F),
                        shape: BoxShape.circle,
                      ),
                      padding: const EdgeInsets.all(8),
                      child: const Icon(
                        Icons.person,
                        color: AppColors.accent,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: AppColors.accent,
                      width: 1.5,
                    ),
                  ),
                ),
              ),
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: AppColors.outline),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.accent.withOpacity(0.15),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: child,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class SectionTitle extends StatelessWidget {
  final String text;

  const SectionTitle(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        color: AppColors.textPrimary,
        fontSize: 16,
        fontWeight: FontWeight.w700,
      ),
    );
  }
}

class LabeledField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final Widget? prefix;
  final Widget? suffix;
  final TextInputType keyboard;
  final int maxLines;
  final bool indianNumberFormat;

  const LabeledField({
    super.key,
    required this.label,
    required this.controller,
    this.prefix,
    this.suffix,
    this.keyboard = TextInputType.number,
    this.maxLines = 1,
    this.indianNumberFormat = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          maxLines: maxLines,
          keyboardType: keyboard,
          style: const TextStyle(color: AppColors.textPrimary),
          inputFormatters: indianNumberFormat
              ? [
                  FilteringTextInputFormatter.digitsOnly,
                  IndianNumberInputFormatter(),
                ]
              : null,
          decoration: InputDecoration(
            filled: true,
            fillColor: AppColors.cardSoft,
            prefixIcon: prefix != null
                ? Padding(
                    padding: const EdgeInsets.all(12),
                    child: prefix,
                  )
                : null,
            suffixIcon: suffix != null
                ? Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 6),
                    child: suffix,
                  )
                : null,
            hintText: 'Enter $label'.replaceAll(':', ''),
            hintStyle: const TextStyle(color: AppColors.textSecondary),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.outline),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.outline),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.accent),
            ),
          ),
        ),
      ],
    );
  }
}

class ToggleRow extends StatelessWidget {
  final String firstLabel;
  final String secondLabel;
  final bool selectedFirst;
  final void Function(bool firstSelected) onChanged;

  const ToggleRow({
    super.key,
    required this.firstLabel,
    required this.secondLabel,
    required this.selectedFirst,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardSoft,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => onChanged(true),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                decoration: BoxDecoration(
                  color: selectedFirst ? AppColors.accent : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  firstLabel,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color:
                        selectedFirst ? Colors.black : AppColors.textPrimary,
                    fontWeight:
                        selectedFirst ? FontWeight.bold : FontWeight.w500,
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () => onChanged(false),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                decoration: BoxDecoration(
                  color: !selectedFirst ? AppColors.accent : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  secondLabel,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color:
                        !selectedFirst ? Colors.black : AppColors.textPrimary,
                    fontWeight:
                        !selectedFirst ? FontWeight.bold : FontWeight.w500,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Small Months / Years toggle used inside text fields
class SmallUnitToggle extends StatelessWidget {
  final String firstLabel;
  final String secondLabel;
  final bool isSecond;
  final ValueChanged<bool> onChanged;

  const SmallUnitToggle({
    super.key,
    required this.firstLabel,
    required this.secondLabel,
    required this.isSecond,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.outline),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildChip(firstLabel, !isSecond, () => onChanged(false)),
          _buildChip(secondLabel, isSecond, () => onChanged(true)),
        ],
      ),
    );
  }

  Widget _buildChip(String text, bool selected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: selected ? AppColors.accent : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          text,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w600,
            color: selected ? Colors.black : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}

class PrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;

  const PrimaryButton({super.key, required this.label, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.accent,
          foregroundColor: Colors.black,
          padding: const EdgeInsets.symmetric(vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
        onPressed: onPressed,
        child: Text(
          label,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class SecondaryButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;

  const SecondaryButton(
      {super.key, required this.label, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.accent,
          side: const BorderSide(color: AppColors.accent),
          padding: const EdgeInsets.symmetric(vertical: 10),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
        onPressed: onPressed,
        child: Text(
          label,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
      ),
    );
  }
}

class ResultCard extends StatelessWidget {
  final List<ResultRow> rows;

  const ResultCard({super.key, required this.rows});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.cardSoft,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.outline),
      ),
      child: Column(
        children: [
          for (int i = 0; i < rows.length; i++) ...[
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              child: rows[i],
            ),
            if (i != rows.length - 1)
              const Divider(color: AppColors.outline, height: 1),
          ],
        ],
      ),
    );
  }
}

class ResultRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;
  final bool showDivider;

  const ResultRow({
    super.key,
    required this.label,
    required this.value,
    this.valueColor,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            label,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 14,
            ),
          ),
        ),
        const SizedBox(width: 10),
        Text(
          value,
          style: TextStyle(
            color: valueColor ?? AppColors.textPrimary,
            fontSize: 15,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}

class StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final bool highlight;

  const StatCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    this.highlight = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = highlight ? AppColors.accent : AppColors.textSecondary;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          if (highlight)
            BoxShadow(
              color: AppColors.accent.withOpacity(0.3),
              blurRadius: 18,
              offset: const Offset(0, 8),
            ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

class CategoryChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  const CategoryChip({
    super.key,
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? AppColors.accent : Colors.transparent,
          borderRadius: BorderRadius.circular(40),
          border: Border.all(
            color: selected ? Colors.transparent : AppColors.textSecondary,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 16,
              color: selected ? Colors.black : AppColors.textSecondary,
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                color: selected ? Colors.black : AppColors.textSecondary,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ExpenseTile extends StatelessWidget {
  final ExpenseItem item;
  final String dateLabel;
  final VoidCallback onDelete;

  const ExpenseTile({
    super.key,
    required this.item,
    required this.dateLabel,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardSoft,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          const Icon(Icons.restaurant_menu,
              color: AppColors.accent, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.description,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${item.category} • $dateLabel',
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 6),
          Text(
            formatCurrency(item.amount),
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
          const SizedBox(width: 10),
          IconButton(
            icon: const Icon(Icons.delete, color: AppColors.danger),
            onPressed: onDelete,
          ),
        ],
      ),
    );
  }
}

class LandResultGrid extends StatelessWidget {
  final Map<String, double> result;

  const LandResultGrid({super.key, required this.result});

  @override
  Widget build(BuildContext context) {
    final entries = result.entries.toList();
    return GridView.builder(
      itemCount: entries.length,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 2.2, // little taller to avoid overflow
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
      ),
      itemBuilder: (_, index) {
        final e = entries[index];
        return Container(
          decoration: BoxDecoration(
            color: AppColors.cardSoft,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.outline),
          ),
          padding: const EdgeInsets.all(10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                e.key,
                style: const TextStyle(
                    color: AppColors.textSecondary, fontSize: 12),
              ),
              const SizedBox(height: 4),
              FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(
                  e.value >= 1000
                      ? '${(e.value / 1000).toStringAsFixed(2)}K'
                      : e.value.toStringAsFixed(2),
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class LandReferenceCard extends StatelessWidget {
  const LandReferenceCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardSoft,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.outline),
      ),
      child: const Text(
        '1 Gunta = 1,089 Square Feet\n'
        '1 Gunta = 121 Square Yards\n'
        '1 Gunta = 0.025 Acres\n'
        '1 Gunta = 101.17 Square Meters\n'
        '1 Acre = 40 Guntas\n'
        '1 Hectare = 2.47 Acres\n'
        '\nExamples:\n'
        '• 5 Guntas = 5,445 Square Feet\n'
        '• 10 Guntas = 0.25 Hectares (approx)\n'
        '• 1 Acre = 43,560 Square Feet',
        style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
      ),
    );
  }
}

// ===== 12) BACKEND PLACEHOLDER ==============================================
//
// Later: Firebase Auth, Firestore, exports etc.
// For now everything is in-memory.
// ============================================================================

