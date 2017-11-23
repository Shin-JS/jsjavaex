package p05.graphic;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics;
import javax.swing.JPanel;

class DrawingPiePanel extends JPanel {
	int num1; // O형의 수
	int num2; // A형의 수
	int num3; // B형의 수
	int num4; // AB형의 수

public void paint(Graphics g) {
		g.clearRect(0, 0, getWidth(), getHeight());
		//값이 입력되지않았으면 return;
		if ((num1 < 0) || (num2 < 0) || (num3 < 0) || (num4 < 0))
			return;
		//전체 합을 구한다
		int total = num1 + num2 + num3 + num4;
		if (total == 0)
			return;
		// 전체에서의 비중을 구함.
		//arc4 = 전체 - (arc1+arc2+arc3)로 구함
		int arc1 = (int) 360.0 * num1 / total;
		int arc2 = (int) 360.0 * num2 / total;
		int arc3 = (int) 360.0 * num3 / total;
		g.setColor(Color.YELLOW);//색상지정
		g.fillArc(50, 20, 200, 200, 0, arc1);//(x축,y축,반지름,반지름,시작각,끝각) - 원호를 그림
		g.setColor(Color.RED);//색상지정
		g.fillArc(50, 20, 200, 200, arc1,arc2);//(x축,y축,반지름,반지름,시작각,끝각) - 원호를 그림
		g.setColor(Color.BLUE);//색상지정
		g.fillArc(50, 20, 200, 200, arc1 + arc2, arc3);//(x축,y축,반지름,반지름,시작각,끝각) - 원호를 그림
		g.setColor(Color.GREEN);//색상지정
		g.fillArc(50, 20, 200, 200, arc1 + arc2 + arc3, 360 - (arc1 + arc2 + arc3));//(x축,y축,반지름,반지름,시작각,끝각) - 원호를 그림
		g.setColor(Color.BLACK);//색상지정
		g.setFont(new Font("굴림체", Font.PLAIN, 12));//폰트 지정
		g.drawString(" O형: 노랑", 300, 150);//범례(legend)
		g.drawString(" A형: 빨강", 300, 170);//범례(legend)
		g.drawString(" B형: 파랑", 300, 190);//범례(legend)
		g.drawString("AB형: 초록", 300, 210);//범례(legend)
	}
	//숫자값 입력받는 메소드
	void setNumbers(int num1, int num2, int num3, int num4) {
		this.num1 = num1;
		this.num2 = num2;
		this.num3 = num3;
		this.num4 = num4;
	}
}