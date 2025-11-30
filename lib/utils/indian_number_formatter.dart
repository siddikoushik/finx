import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

class IndianNumberInputFormatter extends TextInputFormatter {
  final _nf = NumberFormat.decimalPattern('en_IN');

  @override
  TextEditingValue formatEditUpdate(
      TextEditingValue o, TextEditingValue n) {
    final digits = n.text.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.isEmpty) {
      return const TextEditingValue(
        text: '',
        selection: TextSelection.collapsed(offset: 0),
      );
    }
    final value = int.parse(digits);
    final text = _nf.format(value);
    return TextEditingValue(
      text: text,
      selection: TextSelection.collapsed(offset: text.length),
    );
  }
}
