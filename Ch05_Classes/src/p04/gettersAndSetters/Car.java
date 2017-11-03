package p04.gettersAndSetters;
/** [Getter And Setter]
 *  -.getters and setters메소드 
 **/
public class Car {
	//필드
	private int speed;
	private boolean stop;
	//Shift + Alt + s 키 입력시 메뉴창 생김, 거기서 Generate Getters and Setters 선택하면 선택하는대로 알아서 잘 생김
	protected int getSpeed() {
		return speed;
	}
	protected void setSpeed(int speed) {
		if(speed < 0) {
			this.speed = 0;
			return;
		}
		this.speed = speed;
	}
	protected boolean isStop() {
		return stop;
	}
	protected void setStop(boolean stop) {
		this.stop = stop;
		this.speed = 0; //필드값을 메소드에서 처리
	}
	
}

