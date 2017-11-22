package p04.model;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.table.DefaultTableModel;

public class AddActionListener implements ActionListener{
	//처리대상 컴포넌트를 필드로 선언
	JTable table;
	JTextField text1,text2,text3;
	//생성자
	public AddActionListener(JTable table, JTextField text1, JTextField text2, JTextField text3) {
		this.table = table;
		this.text1 = text1;
		this.text2 = text2;
		this.text3 = text3;
	}
	//메소드
	@Override
	public void actionPerformed(ActionEvent e) {
		int row = table.getSelectedRow();		
		String arr[] = new String[3];
		arr[0] = text1.getText();
		arr[1] = text2.getText();
		arr[2] = text3.getText();
		//Table이 가지고 있는 model에는 추가/삭제 기능이 없어서 DefaultTableModel로 바꾼 후 추가하여 모델에 저장함
		DefaultTableModel model = (DefaultTableModel) table.getModel(); //테이블에 있는 데이터 저장 객체(model)을 얻어오는 메소드: getModel();
		if(row<0) {
		model.addRow(arr); //1차원 배열을 모델에 추가하는 메소드: addRow(배열);
		}else {
			model.insertRow(row, arr);
		}
		
		
		
		
	}

}
