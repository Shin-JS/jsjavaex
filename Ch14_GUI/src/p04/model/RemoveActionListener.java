package p04.model;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.swing.JOptionPane;
import javax.swing.JTable;
import javax.swing.table.DefaultTableModel;

public class RemoveActionListener implements ActionListener {
	//처리할 컴포넌트는 table뿐
	JTable table;
	//생성자
	public RemoveActionListener(JTable table) {
		this.table = table;
	}

	@Override
	public void actionPerformed(ActionEvent e) {
		//선택된 행값 가져오기
		int row = table.getSelectedRow(); //마우스로 클릭한 행의 번호를 가져오는 메소드: getSelectedRow();
		if(row==-1) { //row==-1: 선택된 행이 없는경우 row = -1
			return;
		}
		int choice = JOptionPane.showConfirmDialog(table, "삭제하시겟습니까?");
		if(choice!=0) {return;}
//		System.out.println(choice);
		DefaultTableModel model = (DefaultTableModel)table.getModel();
		model.removeRow(row);
	}

}
