package test;
import java.awt.BorderLayout;
import java.awt.Container;
import java.awt.Dimension;
import java.awt.GridLayout;
import java.awt.event.ActionListener;

import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTextField;

import p03.layout.ConfirmButtonActionListener;
public class WindowLayoutExample4 {
	public static void main(String[] args) {
		//윈도우 프레임 생성
		JFrame frame = new JFrame("연락처 프로그램");
		//사이즈 
		frame.setPreferredSize(new Dimension(250, 150));
		//위치
		frame.setLocation(300, 200);
		//컨테이너 얻기
		Container contentPane = frame.getContentPane();
		//컴포넌트 그룹화하는 판넬 생성
		JPanel panel = new JPanel();
		panel.setLayout(new GridLayout(3, 2));//레이아웃 설정
		//컴포넌트 생성
		JLabel lable1 = new JLabel("이름");
		JLabel lable2 = new JLabel("주소");
		JLabel lable3 = new JLabel("전화번호");
		JTextField text1 = new JTextField();
		JTextField text2 = new JTextField();
		JTextField text3 = new JTextField();
		//그룹화 컴포넌트인 panel에 컴포넌트 저장
		panel.add(lable1);
		panel.add(text1);		
		panel.add(lable2);
		panel.add(text2);		
		panel.add(lable3);
		panel.add(text3);
		//컨테이너에 판넬부착
		contentPane.add(panel, BorderLayout.CENTER);//중앙
		JButton button = new JButton("입력");
		contentPane.add(button,BorderLayout.SOUTH);//아래
		//리스너 생성
		 ActionListener listener
		= new InputButtonActionListener(text1, text2, text3);
		 //리스너 부착
		 button.addActionListener(listener);
		//default operation부착
		frame.setDefaultCloseOperation(frame.EXIT_ON_CLOSE);
		frame.pack();
		frame.setVisible(true);
	}
}
