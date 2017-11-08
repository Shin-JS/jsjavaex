package p10.innerInterface;

import p10.innerInterface.Button.OnClickListener;

/**[중첩인터페이스]
 * 
 **/
public class ButtonExample1 {
	public static void main(String[] args) {
		//객체생성
		Button button = new Button();
		//인터페이스의 메소드 매개변수의 다형성
		button.setOnclickListener(new CallListener());
		button.touch();
		
		button.setOnclickListener(new MessageListener());
		button.touch();
		
		//배열
		//최상위 인터페이스 타입 배열 생성
		OnClickListener[] onc = new Button.OnClickListener[2];
		onc[0] = new CallListener();
		onc[1] = new MessageListener();
		for (int i = 0; i<onc.length;i++) {
			button.setOnclickListener(onc[i]); //매개변수의 다형성
			button.touch(); //메소드의 다형성
		}
	}
}
