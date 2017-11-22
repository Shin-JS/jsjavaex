package p03.layout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.JTextField;
public class ConfirmButtonActionListener implements ActionListener{
	//처리대상 컴포넌트를 필드로 선언
	JTextField text1;
	JTextField text2;
	JTextField text3;
	//생성자
	public ConfirmButtonActionListener(JTextField text1, JTextField text2, JTextField text3) {
		this.text1 = text1;
		this.text2 = text2;
		this.text3 = text3;
	}
	//메소드
	@Override
	public void actionPerformed(ActionEvent e) {
		//10개의 주소록 저장 파일에 저장(member.txt); 
		System.out.println(text1.getText()
				      +":"+text2.getText()
				      +":"+text3.getText());
	}
}
