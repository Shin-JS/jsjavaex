package test;
import java.awt.BorderLayout;
import java.awt.Container;
import java.awt.Dimension;
import java.awt.event.ActionListener;
import java.io.File;
import java.io.FileInputStream;
import java.io.ObjectInputStream;

import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JScrollPane;
import javax.swing.JTable;

import p03.layout.PrintActionListener;
/**
 * 앞프로그램에서 입력한 파일을 읽어서 화면에 뿌리기.
 * */
public class WindowLayoutExample5 {
	public static void main(String[] args) {
		//윈도우프레임 생성
		JFrame frame = new JFrame("참가자 명단 프로그램");
		frame.setPreferredSize(new Dimension(300, 150));
		frame.setLocation(300, 200);
		Container contentPane = frame.getContentPane();
		//테이블 만들기
		String colNames[] = {"이름","주소","전화번호"};
		File f = new File("c:/temp/member.dat");
		Object[][] temp =new Object[100][3];
		ObjectInputStream ois=null;
		int i=-1;
		try {
			  ois = new ObjectInputStream(new FileInputStream(f));
	    while(true) {
	    	 Object obj = ois.readObject();
	    	 Member member = (Member)obj;
	    	 temp[++i][0]=member.name;
	    	 temp[i][1]=member.address;
	    	 temp[i][2]=member.tel;
	     }
		}catch(Exception e) {		
		}
		//깊은 복사
		Object[][] data = new Object[i+1][3];
		for(int j=0;j<=i;j++)
			for(int k=0;k<3;k++)
				data[j][k] = temp[j][k];
		//2차원 배열 생성-
		//테이블 객체 생성
		JTable table = new JTable(data,colNames);
		//컨테이너에 배치
		JScrollPane scrollPane = new JScrollPane(table);
		contentPane.add(scrollPane, BorderLayout.CENTER);
		JButton button = new JButton("출력");
		contentPane.add(button,BorderLayout.SOUTH);
		//리스너 객체 생성
		 ActionListener listener
		 	= new PrintActionListener(table) ;
		 //리스너 부착
		 button.addActionListener(listener);
		//
		frame.setDefaultCloseOperation(frame.EXIT_ON_CLOSE);
		frame.pack();
		frame.setVisible(true);
	}
}
