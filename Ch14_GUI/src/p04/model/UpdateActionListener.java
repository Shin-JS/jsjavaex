package p04.model;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.table.DefaultTableModel;

public class UpdateActionListener implements ActionListener {
	//처리할 컴포넌트 필드 선언
	JTable table;
	JTextField text1;
	JTextField text2;
	JTextField text3;
	//생성자
	public UpdateActionListener(JTable table, JTextField text1, JTextField text2, JTextField text3) {
		this.table = table;
		this.text1 = text1;
		this.text2 = text2;
		this.text3 = text3;
	}
	@Override
	public void actionPerformed(ActionEvent e) {
		int row = table.getSelectedRow();
		if(row == -1) {
			return;
		}
		DefaultTableModel model = (DefaultTableModel) table.getModel();
		if(text1.getText().length()>0) {
		model.setValueAt(text1.getText(), row, 0); //해당행의 첫번째 열 수정
		}
		if(text2.getText().length()>0) {
		model.setValueAt(text2.getText(), row, 1); //해당행의 두번째 열 수정
		}
		if(text3.getText().length()>0) {
		model.setValueAt(text3.getText(), row, 2); //해당행의 세번째 열 수정
		}
	}

}
