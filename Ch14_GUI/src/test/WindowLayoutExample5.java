package test;

import java.awt.BorderLayout;
import java.awt.Container;
import java.awt.Dimension;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.table.DefaultTableModel;
/**
 * 앞의 프로그램에서 입력한 파일을 읽어서 화면에 출력시키기..(아래 파일과 같은 방법인듯)
 **/
public class WindowLayoutExample5 {
	public static void main(String[] args) {
		//윈도우프레임생성
		JFrame frame = new JFrame("참가자 명단 프로그램");
		frame.setPreferredSize(new Dimension(300,150));
		frame.setLocation(300, 200);
		Container contentPane = frame.getContentPane();
		//테이블 만들기
//		String colNames[] = {"이름","나이","성별"};
		String colNames[] = {"이름","주소","전화번호"};
		List<String> testlist = new ArrayList<>();
		try {
			BufferedReader br = new BufferedReader(new FileReader("c:/temp/member.txt"));
			while(br.read()!=-1) {
				testlist.add(br.readLine());
			}
			br.close();
		} catch (Exception e) {
			System.out.println(e.getMessage());	
		}
		//테이블 객체 생성
		DefaultTableModel model = new DefaultTableModel(colNames,0);
		JTable table = new JTable(model);
		for(int i = 0; i < testlist.size(); i++) {
			String data = testlist.get(i);
			Object[]test = data.split(",");
			model.addRow(test);
		}
		

		//컨테이너에 배치
		JScrollPane scrollPane = new JScrollPane(table);
		contentPane.add(scrollPane,BorderLayout.CENTER);
		JButton button = new JButton("출력");
		contentPane.add(button,BorderLayout.SOUTH);
		//
		frame.pack();
		frame.setVisible(true);
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
	}
}
