package test;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.BufferedReader;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.List;

import javax.swing.JTable;
import javax.swing.table.DefaultTableModel;
//버튼클릭시 리스트 불러오기 위한 리스너
public class AddActionListener implements ActionListener {
	JTable table;
	//생성자	
	public AddActionListener(JTable table) {
		this.table = table;
	}

	@Override
	public void actionPerformed(ActionEvent e) {
		List<String> testlist = new ArrayList<>(); //파일에 몇개가 있을지 몰라서 Array대신 List사용
		try {
			BufferedReader br = new BufferedReader(new FileReader("c:/temp/member.txt"));
			while(br.read()!=-1) {
				testlist.add(br.readLine());
			}
			br.close();
		} catch (Exception e1) {
			System.out.println(e1.getMessage());	
		}
		DefaultTableModel model = (DefaultTableModel) table.getModel();
			for(int i = 0; i < testlist.size(); i++) {
				String data = testlist.get(i);
				Object[]test = data.split(",");
				model.addRow(test);
			}
	}

}
