package p01.classes;

public class Stock {
	//속성
	private String goodsName;
	private int qty;
	//생성자
	Stock(String goodsName, int qty){
		this.goodsName = goodsName;
		this.qty = qty;
	}
	//메소드
	public String getGoodsName() { //이름 출력
		return goodsName;
	}
	public void setGoodsName(String goodsName) { //이름지정
		this.goodsName = goodsName;
	}
	public int getQty() { //수량 출력
		return qty;
	}
	public void setQty(int qty) { //초기 수량 입력
		this.qty = qty;
	}

	public int inStock(int qty) { //입고
		this.qty += qty;
		return qty; //입고수량 리턴
	}
	public int outStock(int qty) { //출고
		if(this.qty < qty) { //출고수량이 재고수량보다 많을경우
			System.out.println("재고가 부족합니다.");
		}else { //출고수량이 재고수량보다 적거나 같을경우
			this.qty -= qty;
		}return qty;//출고수량 리턴
	}
	
}
