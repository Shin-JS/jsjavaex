package p05.graphic;

import java.awt.Graphics;

import javax.swing.JPanel;
/**
 * Swing에서 JPanel을 상속받고 paint()메소드를 재정의하여 그래픽 그림: 호출하는 클래스에서는 CarDrawingPanel의 paint()메소드가 호출, 실행되어 그림이 그려짐
 **/
public class CarDrawingPanel extends JPanel{
	@Override
	public void paint(Graphics g) {
		g.drawRect(100, 110, 200, 40); //사각형 그리기: drawRect(시작x좌표, 시작y좌표, 폭, 높이)
		g.drawRect(150, 70, 100, 40);
		g.drawOval(125, 150, 30, 30); //원 그리기: drawOval(중심x좌표, 중심y좌표, x축반경, y축반경)
		g.drawOval(245, 150, 30, 30);
		g.drawLine(50, 180, 350, 180); //라인 그리기: drawLine(시작x, 시작y, 끝x,끝y)
	}

}
