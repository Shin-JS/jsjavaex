package p01.windows;

import java.awt.Container;
import java.awt.Dimension;

import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.SwingConstants;

public class WindowsExample2 {
	public static void main(String[] args) {
		JFrame frame = new JFrame("내가만든 첫번째 윈도우 프로그램");
		Container contentPane = frame.getContentPane();
		JLabel label = new JLabel("반갑습니다.GUI",SwingConstants.CENTER);
		frame.setLocation(300, 200);
		frame.setPreferredSize(new Dimension(300,200));;
		contentPane.add(label);
		frame.pack();
		frame.setVisible(true);
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		
	}
}
