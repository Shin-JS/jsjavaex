package test;

public class Goods {
	//필드
	private String name;//상품명
	private long price;//가격
	//생성자
	public Goods(String name, long price) {
		this.name = name;
		this.price = price;
	}
	//메소드
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public long getPrice() {
		return price;
	}
	public void setPrice(long price) {
		this.price = price;
	}
	
}
