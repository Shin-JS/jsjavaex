package p03.layout;

import java.awt.Container;
import java.awt.FlowLayout;

import javax.swing.JButton;
import javax.swing.JFrame;

/** [레이아웃]
 * -.FlowLayout: 가로로 배치되어있다가 폭이 좁아지면 컴포넌트들이 아래로 내려오는 컴포넌트 구조
 **/
public class WindowLayoutExample2 {
	public static void main(String[] args) {
		//윈도우 프레임생성
		JFrame frame = new JFrame("과일 바구니");
		//컨테이너 구하기
		Container contentPane = frame.getContentPane();
		//레이아웃 생성
		FlowLayout flowLayout = new FlowLayout();
		contentPane.setLayout(flowLayout);
		contentPane.add(new JButton("사과"));
		contentPane.add(new JButton("파인애플"));
		contentPane.add(new JButton("오렌지"));
		contentPane.add(new JButton("포도"));
		contentPane.add(new JButton("레몬"));
		contentPane.add(new JButton("복숭아"));
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.pack();
		frame.setVisible(true);
	}
}
