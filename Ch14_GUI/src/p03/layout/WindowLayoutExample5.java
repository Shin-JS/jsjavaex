package p03.layout;
import java.awt.BorderLayout;
import java.awt.Container;
import java.awt.Dimension;
import java.awt.event.ActionListener;

import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JScrollPane;
import javax.swing.JTable;
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
		String colNames[] = {"이름","나이","성별"};
		//String colNames[] = {"이름","주소","전화번호"};
		Object data[][] = {{"김철수",24,'남'},
				           {"홍길동",21,'여'},
				           {"일지매",26,'여'} };
		//2차원 배열 생성-
		//테이블 객체 생성
		JTable table = new JTable(data,colNames);
		//컨테이너에 배치
		JScrollPane scrollPane = new JScrollPane(table);
		contentPane.add(scrollPane, BorderLayout.CENTER);
		JButton button = new JButton("출력");
		contentPane.add(button,BorderLayout.SOUTH);
		//리스너 객체 생성
		ActionListener listener = new PrintActionListener(table);
		button.addActionListener(listener);
		//
		frame.setDefaultCloseOperation(frame.EXIT_ON_CLOSE);
		frame.pack();
		frame.setVisible(true);
	}
}
