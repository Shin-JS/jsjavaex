package p03.prepareGui;
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

public class AddressGui {
	public static void main(String[] args) {
		JFrame frame = new JFrame("연락처 프로그램");
		frame.setPreferredSize(new Dimension(250,150));
		frame.setLocation(400, 300);
		Container contentPane = frame.getContentPane();
		JPanel panel = new JPanel();
		panel.setLayout(new GridLayout(3, 2));
		JTextField text1 = new JTextField();
		JTextField text2 = new JTextField();
		JTextField text3 = new JTextField();
		JButton button = new JButton("입력");
		panel.add(new JLabel("이름"));
		panel.add(text1);
		panel.add(new JLabel("주소"));
		panel.add(text2);
		panel.add(new JLabel("전화번호"));
		panel.add(text3);
		contentPane.add(panel,BorderLayout.CENTER);
		//리스너 부착
		ActionListener listner = new AddActionListener(text1, text2, text3);
		button.addActionListener(listner);
		contentPane.add(button,BorderLayout.SOUTH);
		frame.setDefaultCloseOperation(frame.EXIT_ON_CLOSE);
		frame.pack();
		frame.setVisible(true);
		
	}
}
