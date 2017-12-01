package p03.prepareGui;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.swing.JOptionPane;
import javax.swing.JTable;
import javax.swing.table.TableModel;
/**
 * -.ActionListener: 이벤트 발생 여부를 모니터링하는 객체, 이벤트 발생시 처리하는 개체  
 **/
public class PrintActionListener implements ActionListener{
	//필드
	JTable table;
	//생성자: 객체 생성시 처리할 테이블을 가지고 생성됨
	public PrintActionListener(JTable table) {
		this.table = table;
	}

	//이벤트 발생시 처리할 메소드
	@Override
	public void actionPerformed(ActionEvent e) {
		//JTable에 있는 데이터를 담고 있는 객체는 Model임
/*		TableModel model = table.getModel();
		int rowNum = model.getRowCount(); //행의 수
		int rowCount = model.getColumnCount(); //열의 수
*/		int selectedRow = table.getSelectedRow(); //선택된 행 번호 반환

		if(selectedRow > -1) {
			int i = 0;
			int no = (int) table.getValueAt(selectedRow, i);
			String name = (String) table.getValueAt(selectedRow, ++i);
			String address = (String) table.getValueAt(selectedRow, ++i);
			String tel = (String) table.getValueAt(selectedRow, ++i);
//			System.out.println(no+":"+name+":"+address+":"+tel);
			JOptionPane.showMessageDialog(table, no+":"+name+":"+address+":"+tel);
		}

		
	}

}
