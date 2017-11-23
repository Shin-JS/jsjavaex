package test;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.swing.JTable;
import javax.swing.table.TableModel;

public class PrintActionListener implements ActionListener {
	//테이블필드
	JTable table;
	//생성자
	public PrintActionListener(JTable table) {
		this.table = table;
	}
	//메소드
	@Override
	public void actionPerformed(ActionEvent e) {
		//JTable에 있는 데이타를 담고있는 객체 Model
	 TableModel model = table.getModel();
	 int rowNum = model.getRowCount();//행의 수
	 int colNum = model.getColumnCount();//열의 수
	 for(int col=0;col<colNum;col++) {
		 String colName = model.getColumnName(col);//인덱스 번지에 해당하는 칼럼명
		 System.out.print(colName+"\t");
	 }
	 System.out.println();
	 for(int row = 0;row<rowNum;row++) {
		 for(int col=0;col<colNum;col++) {
			 Object obj = model.getValueAt(row, col);//행열의 값을 가져오는 메소드 getValueAt(행,열)
			 System.out.print(obj+"\t");
		 }
		 System.out.println();
	 }
	 System.out.println("-----------------------");
	}
}
