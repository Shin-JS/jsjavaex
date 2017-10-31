package wrapup;

public class Person {
	private String name;
	private int score;
	
	
	
	public String getName() {
		return this.name;
	}
	
	public int getScore() {
		return this.score;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public void setScore(int score) {
		this.score = score;
	}
	//Source -> generate getters and setters 메뉴로 위에 항목 생성 가능
	
	
	@Override
	public String toString() {
		return "\n이름:" + this.name + "  점수:" + this.score + "\n";
	}
}
