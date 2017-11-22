package p05.graphic;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.swing.JOptionPane;
import javax.swing.JTextField;

public class DrawActionListener implements ActionListener {
	//처리해야할 컴포넌트 필드로 선언
	JTextField text1,text2,text3;
	DrawingPanel drawingPanel;
	//생성자
	public DrawActionListener(JTextField text1, JTextField text2, JTextField text3, DrawingPanel drawingPanel) {
		this.text1 = text1;
		this.text2 = text2;
		this.text3 = text3;
		this.drawingPanel = drawingPanel;
	}
	//메소드
	@Override
	public void actionPerformed(ActionEvent e) {
		try {
			int korean = Integer.parseInt(text1.getText()); //숫자형문자열 → 숫자
			int english = Integer.parseInt(text2.getText()); //숫자형문자열 → 숫자
			int math = Integer.parseInt(text3.getText()); //숫자형문자열 → 숫자
			drawingPanel.setScores(korean, english, math);
			drawingPanel.repaint(); //호출시마다 paint()메소드를 호출하여 그림을 다시 그리는 메소드
		} catch (NumberFormatException nfe) {
			JOptionPane.showMessageDialog(drawingPanel, "잘못된 숫자 형식입니다.","에러메세지",JOptionPane.ERROR_MESSAGE);
		}
	}

}
