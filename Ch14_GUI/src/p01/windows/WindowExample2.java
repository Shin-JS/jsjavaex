package p01.windows;
/** [GUI]
 * 	-.Frame위에 Container를 얹고 필요한 컴포넌트들을 담아서 만듬
 **/

import java.awt.Container; //awt
import java.awt.Dimension;

import javax.swing.JFrame; //swing
import javax.swing.JLabel; //swing
import javax.swing.SwingConstants;

public class WindowExample2 {
	public static void main(String[] args) {
		/*1단계. 윈도우 프로그램 만들기*/
		//윈도우프레임 생성
		JFrame frame = new JFrame("Hello Java Program");
		//프레임크기 조정
		frame.setPreferredSize(new Dimension(300,200));
		//프레임위치 조정(프레임의 시작위치)
		frame.setLocation(810, 440);
		//컴포넌트들을 담을 컨테이너 생성
		Container contentPane = frame.getContentPane();
		//문자를 출력할 라벨컴포넌트 생성
		JLabel label = new JLabel("Hello Java",SwingConstants.CENTER); //텍스트 위치 조정: SwingConsatants
		//생성한 라벨컴포넌트를 컨테이너에 담기
		contentPane.add(label);
		//윈도우 우측상단의 x버튼을 클릭시 프로그램이 종료되도록
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		/*2단계. 화면에 디스플레이*/
		//화면에 나타나는 모양 보정
		frame.pack();
		//화면에 나타내기: setVisible(true)
		frame.setVisible(true);
	}
	
}
